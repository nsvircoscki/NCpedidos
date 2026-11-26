import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { banco, obrigatoria } from './banco.js';

const SEGREDO = obrigatoria('JWT_SEGREDO');
const VALIDADE_DO_TOKEN = '12h';

export interface Representante {
    id: number;
    nome: string;
    email: string;
    admin: boolean;
}

/** Devolve a sessão no formato do front (`Sessao` em src/app/models/usuario.model.ts) ou null. */
export async function entrar(email: string, senha: string): Promise<{ token: string; usuario: Representante } | null> {
    const { rows } = await banco.query<Representante & { senha_hash: string }>(
        'select id, nome, email, admin, senha_hash from representantes where lower(email) = lower($1)',
        [email.trim()],
    );
    const encontrado = rows[0];
    if (!encontrado || !(await bcrypt.compare(senha, encontrado.senha_hash))) return null;

    const usuario = { id: encontrado.id, nome: encontrado.nome, email: encontrado.email, admin: encontrado.admin };
    const token = jwt.sign({ sub: String(usuario.id) }, SEGREDO, { expiresIn: VALIDADE_DO_TOKEN });
    return { token, usuario };
}

/** Middleware: só passa com token válido e guarda o id do representante em `res.locals`. */
export function exigirLogin(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    try {
        const { sub } = jwt.verify(token ?? '', SEGREDO) as { sub: string };
        res.locals['representanteId'] = Number(sub);
        next();
    } catch {
        res.status(401).json({ erro: 'Faça login novamente.' });
    }
}

/** Middleware depois do `exigirLogin`: confere no banco, para valer na hora se o admin for retirado. */
export async function exigirAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    const { rows } = await banco.query('select 1 from representantes where id = $1 and admin', [res.locals['representanteId']]);
    if (rows.length) next();
    else res.status(403).json({ erro: 'Só o administrador pode fazer isso.' });
}

export function senhaValida(senha: unknown): senha is string {
    return typeof senha === 'string' && senha.length >= 8;
}

// Freio contra adivinhar senha: no máximo 10 tentativas erradas por IP a cada 15 minutos.
const JANELA_MS = 15 * 60 * 1000;
const MAXIMO_TENTATIVAS = 10;
const tentativas = new Map<string, { quantidade: number; desde: number }>();

export function bloqueadoPorTentativas(ip: string): boolean {
    const registro = tentativas.get(ip);
    if (!registro || Date.now() - registro.desde > JANELA_MS) return false;
    return registro.quantidade >= MAXIMO_TENTATIVAS;
}

export function registrarTentativaErrada(ip: string): void {
    const registro = tentativas.get(ip);
    if (!registro || Date.now() - registro.desde > JANELA_MS) {
        tentativas.set(ip, { quantidade: 1, desde: Date.now() });
    } else {
        registro.quantidade++;
    }
}

export function limparTentativas(ip: string): void {
    tentativas.delete(ip);
}
