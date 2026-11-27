import bcrypt from 'bcryptjs';
import type { CookieOptions, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { banco, obrigatoria } from './banco.js';
import { chaveDe, cifrar, decifrar } from './cifra.js';
import { linkDoAutenticador, novoSegredo, passoDoCodigo } from './totp.js';

const SEGREDO = obrigatoria('JWT_SEGREDO');
if (process.env['NODE_ENV'] === 'production' && SEGREDO.length < 32) {
    throw new Error('JWT_SEGREDO curto demais para produção (use pelo menos 32 caracteres aleatórios).');
}
// Trocar o JWT_SEGREDO derruba as sessões e obriga a ativar de novo a verificação em duas etapas.
const CHAVE_TOTP = chaveDe(SEGREDO, 'nc-pedidos verificacao em duas etapas');
const VALIDADE_DA_SESSAO_MS = 12 * 60 * 60 * 1000;
const VALIDADE_DO_CODIGO_MS = 5 * 60 * 1000;
// Comparar com um hash qualquer quando o usuário não existe: a resposta demora o mesmo e não entrega quem tem conta.
const HASH_SEM_USUARIO = bcrypt.hashSync('nenhum-usuario-tem-esta-senha', 10);

// A sessão fica num cookie que o JavaScript da página não lê (HttpOnly): um script malicioso não rouba o login.
// SameSite=Strict: o navegador não manda o cookie em pedidos que começam em outro site.
const COOKIE_SESSAO = 'sessao';
// Senha certa de quem tem verificação em duas etapas: vale só para mandar o código, por 5 minutos.
const COOKIE_CODIGO = 'login_pendente';
const OPCOES_COOKIE: CookieOptions = { httpOnly: true, secure: true, sameSite: 'strict', path: '/api' };

export interface Representante {
    id: number;
    nome: string;
    usuario: string;
    admin: boolean;
    /** Senha provisória (dada pelo admin ou pela importação): só pode criar a sua até trocar. */
    trocarSenha: boolean;
    /** Verificação em duas etapas ativa (código do app autenticador no login). */
    doisPassos: boolean;
}

const CAMPOS_REPRESENTANTE = 'id, nome, usuario, admin, trocar_senha as "trocarSenha", totp_ativo as "doisPassos"';

export async function representantePorId(id: number): Promise<Representante | undefined> {
    const { rows: [usuario] } = await banco.query<Representante>(`select ${CAMPOS_REPRESENTANTE} from representantes where id = $1`, [id]);
    return usuario;
}

/** O usuário, se a senha confere; null se não. */
export async function entrar(usuario: string, senha: string): Promise<Representante | null> {
    const { rows: [encontrado] } = await banco.query<Representante & { senha_hash: string }>(
        `select ${CAMPOS_REPRESENTANTE}, senha_hash from representantes where usuario = lower($1)`,
        [usuario.trim()],
    );
    const senhaConfere = await bcrypt.compare(senha, encontrado?.senha_hash ?? HASH_SEM_USUARIO);
    if (!encontrado || !senhaConfere) return null;
    const { senha_hash: _hash, ...dados } = encontrado;
    return dados;
}

export async function senhaConfere(id: number, senha: unknown): Promise<boolean> {
    if (typeof senha !== 'string') return false;
    const { rows: [usuario] } = await banco.query<{ senha_hash: string }>('select senha_hash from representantes where id = $1', [id]);
    return !!usuario && bcrypt.compare(senha, usuario.senha_hash);
}

/** `emitidoEm` (segundos): o horário da troca de senha, para a sessão nova valer junto com ela. */
export function gravarSessao(res: Response, id: number, emitidoEm?: number): void {
    const token = jwt.sign({ sub: String(id), tipo: 'sessao', ...(emitidoEm ? { iat: emitidoEm } : {}) }, SEGREDO, {
        expiresIn: VALIDADE_DA_SESSAO_MS / 1000,
    });
    res.cookie(COOKIE_SESSAO, token, { ...OPCOES_COOKIE, maxAge: VALIDADE_DA_SESSAO_MS });
}

export function apagarSessao(res: Response): void {
    res.clearCookie(COOKIE_SESSAO, OPCOES_COOKIE);
}

export function gravarLoginPendente(res: Response, id: number): void {
    const token = jwt.sign({ sub: String(id), tipo: 'codigo' }, SEGREDO, { expiresIn: VALIDADE_DO_CODIGO_MS / 1000 });
    res.cookie(COOKIE_CODIGO, token, { ...OPCOES_COOKIE, path: '/api/auth', maxAge: VALIDADE_DO_CODIGO_MS });
}

export function apagarLoginPendente(res: Response): void {
    res.clearCookie(COOKIE_CODIGO, { ...OPCOES_COOKIE, path: '/api/auth' });
}

/** Id de quem acertou a senha e ainda falta o código, ou null. */
export function lerLoginPendente(req: Request): number | null {
    return lerToken(lerCookie(req, COOKIE_CODIGO), 'codigo')?.id ?? null;
}

/**
 * Troca a senha e encerra as sessões abertas (ver `autenticar`). `provisoria`: a pessoa cria a sua no próximo
 * login, e a verificação em duas etapas é desligada (é o caminho de quem perdeu a senha ou o celular).
 * Devolve o horário da troca, para quem trocou a própria senha seguir logado.
 */
export async function trocarSenha(id: number, senha: string, provisoria: boolean): Promise<{ usuario: Representante; emitidoEm: number } | null> {
    const { rows: [trocada] } = await banco.query<{ desde: string }>(
        `update representantes set senha_hash = $1, trocar_senha = $2, sessao_desde = date_trunc('second', now()),
                totp_ativo = totp_ativo and not $2, totp_segredo = case when $2 then null else totp_segredo end
          where id = $3 returning extract(epoch from sessao_desde)::bigint as desde`,
        [await bcrypt.hash(senha, 10), provisoria, id],
    );
    const usuario = trocada && (await representantePorId(id));
    return usuario ? { usuario, emitidoEm: Number(trocada.desde) } : null;
}

/** Começa a ativação: segredo novo (cifrado no banco) para a pessoa pôr no app autenticador. */
export async function iniciarDoisPassos(id: number, usuario: string): Promise<{ segredo: string; link: string }> {
    const segredo = novoSegredo();
    await banco.query(
        'update representantes set totp_segredo = $1, totp_ultimo_passo = 0 where id = $2 and not totp_ativo',
        [cifrar(segredo, CHAVE_TOTP), id],
    );
    return { segredo, link: linkDoAutenticador(segredo, usuario) };
}

/** Confere o código do app; cada código vale uma vez só (quem o viu por cima do ombro não reaproveita). */
export async function codigoConfere(id: number, codigo: unknown): Promise<boolean> {
    const { rows: [usuario] } = await banco.query<{ totp_segredo: string | null }>(
        'select totp_segredo from representantes where id = $1', [id],
    );
    if (!usuario?.totp_segredo) return false;
    const passo = passoDoCodigo(decifrar(usuario.totp_segredo, CHAVE_TOTP), codigo);
    if (passo === null) return false;
    const { rowCount } = await banco.query(
        'update representantes set totp_ultimo_passo = $1 where id = $2 and totp_ultimo_passo < $1', [passo, id],
    );
    return rowCount === 1;
}

/** Middleware: só passa quem já criou a própria senha. */
export const exigirLogin = autenticar(false);
/** Middleware só da troca de senha: aceita também quem ainda está com a senha provisória. */
export const exigirLoginComSenhaProvisoria = autenticar(true);

/**
 * Só passa com sessão válida de um usuário que ainda existe e não trocou a senha depois do login.
 * Guarda o id, o usuário, se é admin e se tem verificação em duas etapas em `res.locals`, lidos do banco a cada
 * chamada: excluir o usuário, trocar a senha ou tirar o admin vale na hora, sem esperar a sessão vencer.
 */
function autenticar(aceitaSenhaProvisoria: boolean) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = lerToken(lerCookie(req, COOKIE_SESSAO), 'sessao');
        const { rows: [usuario] } = token
            ? await banco.query<{ usuario: string; admin: boolean; trocar_senha: boolean; totp_ativo: boolean }>(
                `select usuario, admin, trocar_senha, totp_ativo from representantes
                  where id = $1 and extract(epoch from sessao_desde) <= $2`,
                [token.id, token.emitidoEm],
            )
            : { rows: [] };
        if (!token || !usuario) {
            res.status(401).json({ erro: 'Faça login novamente.' });
            return;
        }
        if (usuario.trocar_senha && !aceitaSenhaProvisoria) {
            res.status(403).json({ erro: 'Crie a sua senha antes de continuar.' });
            return;
        }
        res.locals['representanteId'] = token.id;
        res.locals['usuario'] = usuario.usuario;
        res.locals['admin'] = usuario.admin;
        res.locals['doisPassos'] = usuario.totp_ativo;
        next();
    };
}

/** Middleware depois do `exigirLogin`. A administração exige a verificação em duas etapas. */
export function exigirAdmin(_req: Request, res: Response, next: NextFunction): void {
    if (!res.locals['admin']) {
        res.status(403).json({ erro: 'Só o administrador pode fazer isso.' });
    } else if (!res.locals['doisPassos']) {
        res.status(403).json({ erro: 'Ative a verificação em duas etapas para usar a administração.' });
    } else {
        next();
    }
}

function lerToken(token: string, tipo: 'sessao' | 'codigo'): { id: number; emitidoEm: number } | null {
    try {
        const dados = jwt.verify(token, SEGREDO, { algorithms: ['HS256'] }) as { sub: string; iat: number; tipo: string };
        return dados.tipo === tipo ? { id: Number(dados.sub), emitidoEm: dados.iat } : null;
    } catch {
        return null;
    }
}

// Sem pacote extra: o cabeçalho é "nome=valor; outro=valor".
function lerCookie(req: Request, nome: string): string {
    for (const parte of (req.headers.cookie ?? '').split(';')) {
        const [chave, ...valor] = parte.trim().split('=');
        if (chave === nome) return decodeURIComponent(valor.join('='));
    }
    return '';
}
