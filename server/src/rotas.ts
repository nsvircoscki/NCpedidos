import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { banco } from './banco.js';
import { registrar } from './auditoria.js';
import {
    apagarLoginPendente, apagarSessao, codigoConfere, entrar, exigirAdmin, exigirLogin, exigirLoginComSenhaProvisoria,
    gravarLoginPendente, gravarSessao, iniciarDoisPassos, lerLoginPendente, representantePorId, senhaConfere, trocarSenha,
} from './login.js';
import { MENSAGEM_SENHA, problemaNaSenhaNova, senhaValida } from './senhas.js';
import { bloqueadoPorTentativas, limparTentativas, registrarTentativaErrada } from './tentativas.js';

export const rotas = Router();

rotas.post('/auth/login', async (req, res) => {
    const ip = req.ip ?? '';
    const { usuario, senha } = req.body ?? {};
    const nome = typeof usuario === 'string' ? usuario.trim().toLowerCase() : '';
    res.locals['usuario'] = nome;
    if (bloqueadoPorTentativas(ip, nome)) {
        res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
        return;
    }

    const encontrado = nome && typeof senha === 'string' ? await entrar(nome, senha) : null;
    if (!encontrado) {
        registrarTentativaErrada(ip, nome);
        await registrar(req, res, 'login recusado');
        res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
        return;
    }
    res.locals['representanteId'] = encontrado.id;
    if (encontrado.doisPassos) {
        gravarLoginPendente(res, encontrado.id);
        await registrar(req, res, 'senha certa, falta o código');
        res.json({ precisaCodigo: true });
        return;
    }
    limparTentativas(ip, nome);
    gravarSessao(res, encontrado.id);
    await registrar(req, res, 'login');
    res.json({ usuario: encontrado });
});

// Segunda etapa do login: o código do app autenticador. Os erros contam como tentativa de login.
rotas.post('/auth/login/codigo', async (req, res) => {
    const id = lerLoginPendente(req);
    const usuario = id === null ? undefined : await representantePorId(id);
    if (!usuario) {
        res.status(401).json({ erro: 'O tempo acabou. Entre de novo com usuário e senha.' });
        return;
    }
    const ip = req.ip ?? '';
    res.locals['representanteId'] = usuario.id;
    res.locals['usuario'] = usuario.usuario;
    if (bloqueadoPorTentativas(ip, usuario.usuario)) {
        res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
        return;
    }
    if (!(await codigoConfere(usuario.id, req.body?.codigo))) {
        registrarTentativaErrada(ip, usuario.usuario);
        await registrar(req, res, 'código errado no login');
        res.status(400).json({ erro: 'Código incorreto. Confira no app e digite o código atual.' });
        return;
    }
    limparTentativas(ip, usuario.usuario);
    apagarLoginPendente(res);
    gravarSessao(res, usuario.id);
    await registrar(req, res, 'login');
    res.json({ usuario });
});

rotas.post('/auth/sair', (_req, res) => {
    apagarSessao(res);
    apagarLoginPendente(res);
    res.status(204).end();
});

// Ativar a verificação em duas etapas: 1) segredo novo para o app; 2) o primeiro código do app confirma.
rotas.post('/auth/dois-passos/iniciar', exigirLogin, async (_req, res) => {
    if (res.locals['doisPassos']) {
        res.status(409).json({ erro: 'A verificação em duas etapas já está ativa.' });
        return;
    }
    res.json(await iniciarDoisPassos(res.locals['representanteId'], res.locals['usuario']));
});

rotas.post('/auth/dois-passos/ativar', exigirLogin, async (req, res) => {
    const id: number = res.locals['representanteId'];
    const ip = req.ip ?? '';
    if (bloqueadoPorTentativas(ip, res.locals['usuario'])) {
        res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
        return;
    }
    if (res.locals['doisPassos'] || !(await codigoConfere(id, req.body?.codigo))) {
        registrarTentativaErrada(ip, res.locals['usuario']);
        res.status(400).json({ erro: 'Código incorreto. Confira no app e digite o código atual.' });
        return;
    }
    await banco.query('update representantes set totp_ativo = true where id = $1', [id]);
    await registrar(req, res, 'ativou a verificação em duas etapas');
    res.json({ usuario: await representantePorId(id) });
});

// A própria pessoa troca a senha (e cria a sua no primeiro login). Pede a atual: com um token roubado não dá.
// Os erros na senha atual contam como tentativa de login, para ninguém adivinhar por aqui.
rotas.put('/auth/senha', exigirLoginComSenhaProvisoria, async (req, res) => {
    const ip = req.ip ?? '';
    const id: number = res.locals['representanteId'];
    const usuario: string = res.locals['usuario'];
    const { senhaAtual, senhaNova } = (req.body ?? {}) as Record<string, unknown>;
    if (bloqueadoPorTentativas(ip, usuario)) {
        res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
        return;
    }
    if (!(await senhaConfere(id, senhaAtual))) {
        registrarTentativaErrada(ip, usuario);
        await registrar(req, res, 'errou a senha atual ao trocar');
        res.status(400).json({ erro: 'A senha atual não confere.' });
        return;
    }
    const problema = problemaNaSenhaNova(senhaNova, String(senhaAtual), usuario);
    if (problema) {
        res.status(400).json({ erro: problema });
        return;
    }
    const trocada = await trocarSenha(id, String(senhaNova), false);
    if (!trocada) {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
        return;
    }
    gravarSessao(res, id, trocada.emitidoEm);
    await registrar(req, res, 'trocou a própria senha');
    res.json({ usuario: trocada.usuario });
});

rotas.get('/clientes', exigirLogin, async (_req, res) => {
    res.json(await clientesDoRepresentante(res.locals['representanteId']));
});

// Produto ainda sem código no ERP: entra em toda tabela e o representante descreve o que precisa.
// Fica aqui, e não no banco, para a reimportação das planilhas não apagar.
const PRODUTO_DESENVOLVIMENTO = { codigo: 'DESENV', descricao: 'PRODUTO DESENVOLVIMENTO', unidade: 'UN', pedeDescricao: true };

// Sem preço: o MVP não mostra preço na tela nem no PDF.
rotas.get('/clientes/:id/produtos', exigirLogin, async (req, res) => {
    const { rows: [cliente] } = await banco.query(
        'select tabela_codigo from clientes where id = $1 and representante_id = $2 and not inativo',
        [idDaRota(req.params.id), res.locals['representanteId']],
    );
    if (!cliente) {
        res.status(404).json({ erro: 'Cliente não encontrado.' });
        return;
    }

    const { rows } = await banco.query(
        `select p.codigo, p.descricao, p.unidade
           from itens_tabela i join produtos p on p.codigo = i.produto_codigo
          where i.tabela_codigo = $1 order by p.descricao, p.codigo`,
        [cliente.tabela_codigo],
    );
    res.json([PRODUTO_DESENVOLVIMENTO, ...rows]);
});

rotas.get('/usuarios', exigirLogin, exigirAdmin, async (_req, res) => {
    const { rows } = await banco.query(
        `select r.id, r.nome, r.usuario, r.admin, count(c.id)::int as clientes
           from representantes r left join clientes c on c.representante_id = r.id and not c.inativo
          group by r.id order by r.nome`,
    );
    res.json(rows);
});

rotas.post('/usuarios', exigirLogin, exigirAdmin, async (req, res) => {
    const dados = dadosDoUsuario(req.body);
    if (typeof dados === 'string') {
        res.status(400).json({ erro: dados });
        return;
    }
    const { senha } = req.body;
    if (!senhaValida(senha)) {
        res.status(400).json({ erro: MENSAGEM_SENHA });
        return;
    }

    // A senha dada pelo admin é provisória: a pessoa cria a sua no primeiro login.
    const { rows: [criado] } = await banco.query(
        `insert into representantes (nome, usuario, senha_hash, admin, trocar_senha) values ($1, $2, $3, $4, true)
         on conflict (usuario) do nothing
         returning id, nome, usuario, admin, 0 as clientes`,
        [dados.nome, dados.usuario, await bcrypt.hash(senha, 10), dados.admin],
    );
    if (!criado) {
        res.status(409).json({ erro: 'Esse nome de usuário já existe.' });
        return;
    }
    await registrar(req, res, 'criou usuário', `${criado.usuario}${criado.admin ? ' (admin)' : ''}`);
    res.status(201).json(criado);
});

rotas.put('/usuarios/:id', exigirLogin, exigirAdmin, async (req, res) => {
    const id = idDaRota(req.params.id);
    const dados = dadosDoUsuario(req.body);
    if (typeof dados === 'string') {
        res.status(400).json({ erro: dados });
        return;
    }
    // Sem isso o último admin poderia se trancar fora da tela Usuários.
    if (id === res.locals['representanteId'] && !dados.admin) {
        res.status(400).json({ erro: 'Você não pode tirar o seu próprio acesso de administrador.' });
        return;
    }

    try {
        const { rows: [alterado] } = await banco.query(
            `update representantes r set nome = $1, usuario = $2, admin = $3 where id = $4
             returning id, nome, usuario, admin,
                (select count(*)::int from clientes where representante_id = r.id and not inativo) as clientes`,
            [dados.nome, dados.usuario, dados.admin, id],
        );
        if (!alterado) {
            res.status(404).json({ erro: 'Usuário não encontrado.' });
            return;
        }
        await registrar(req, res, 'editou usuário', `${alterado.nome} (${alterado.usuario})${alterado.admin ? ', admin' : ''}`);
        res.json(alterado);
    } catch (erro) {
        if ((erro as { code?: string }).code !== VIOLOU_UNICO) throw erro;
        res.status(409).json({ erro: 'Esse nome de usuário já existe.' });
    }
});

// Os clientes dele são apagados junto, e a importação do ERP não traz de volta nem ele nem os clientes (migração 008).
rotas.delete('/usuarios/:id', exigirLogin, exigirAdmin, async (req, res) => {
    const id = idDaRota(req.params.id);
    if (id === res.locals['representanteId']) {
        res.status(400).json({ erro: 'Você não pode excluir o seu próprio usuário.' });
        return;
    }
    const { rows: [excluido] } = await banco.query<{ usuario: string }>('delete from representantes where id = $1 returning usuario', [id]);
    if (!excluido) {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
        return;
    }
    await registrar(req, res, 'excluiu usuário', excluido.usuario);
    res.status(204).end();
});

// O admin troca a senha de qualquer usuário (é o caminho do "esqueci minha senha" no MVP).
// A de outra pessoa é provisória: ela cria a sua no próximo login, e a verificação em duas etapas é desligada
// (é o caminho de quem perdeu a senha ou o celular).
rotas.put('/usuarios/:id/senha', exigirLogin, exigirAdmin, async (req, res) => {
    const { senha } = req.body ?? {};
    if (!senhaValida(senha)) {
        res.status(400).json({ erro: MENSAGEM_SENHA });
        return;
    }
    const id = idDaRota(req.params.id);
    const trocada = id === null ? null : await trocarSenha(id, senha, id !== res.locals['representanteId']);
    if (!trocada) {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
        return;
    }
    // A própria senha: a troca derruba as sessões, então a deste aparelho é renovada.
    if (id === res.locals['representanteId']) gravarSessao(res, trocada.usuario.id, trocada.emitidoEm);
    await registrar(req, res, 'trocou a senha de', trocada.usuario.usuario);
    res.status(204).end();
});

// Clientes e tabelas pelo admin. O que ele muda ganha data de edição, e a importação do ERP não mexe mais.

rotas.get('/usuarios/:id/clientes', exigirLogin, exigirAdmin, async (req, res) => {
    res.json(await clientesDoRepresentante(idDaRota(req.params.id), true));
});

rotas.post('/clientes', exigirLogin, exigirAdmin, async (req, res) => {
    const dados = await dadosDoCliente(req.body);
    if (typeof dados === 'string') {
        res.status(400).json({ erro: dados });
        return;
    }
    const { rows: [{ id }] } = await banco.query(
        `insert into clientes (representante_id, nome, cidade, uf, tabela_codigo, editado_em)
         values ($1, $2, $3, $4, $5, now()) returning id`,
        [dados.representanteId, dados.nome, dados.cidade, dados.uf, dados.codigoTabela],
    );
    await registrar(req, res, 'cadastrou cliente', `${dados.nome} (id ${id})`);
    res.status(201).json(await clientePorId(id));
});

rotas.put('/clientes/:id', exigirLogin, exigirAdmin, async (req, res) => {
    const dados = await dadosDoCliente(req.body);
    if (typeof dados === 'string') {
        res.status(400).json({ erro: dados });
        return;
    }
    const id = idDaRota(req.params.id);
    const { rowCount } = await banco.query(
        `update clientes set representante_id = $1, nome = $2, cidade = $3, uf = $4, tabela_codigo = $5, editado_em = now()
          where id = $6`,
        [dados.representanteId, dados.nome, dados.cidade, dados.uf, dados.codigoTabela, id],
    );
    if (!rowCount) {
        res.status(404).json({ erro: 'Cliente não encontrado.' });
        return;
    }
    await registrar(req, res, 'editou cliente', `${dados.nome} (id ${id})`);
    res.json(await clientePorId(id));
});

// Inativo some da lista do representante, mas continua no banco e pode voltar. A importação não o reativa.
rotas.put('/clientes/:id/ativo', exigirLogin, exigirAdmin, async (req, res) => {
    const { ativo } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof ativo !== 'boolean') {
        res.status(400).json({ erro: 'Informe se o cliente fica ativo.' });
        return;
    }
    const id = idDaRota(req.params.id);
    const { rows: [cliente] } = await banco.query<{ nome: string }>(
        'update clientes set inativo = $1, editado_em = now() where id = $2 returning nome', [!ativo, id],
    );
    if (!cliente) {
        res.status(404).json({ erro: 'Cliente não encontrado.' });
        return;
    }
    await registrar(req, res, ativo ? 'reativou cliente' : 'inativou cliente', `${cliente.nome} (id ${id})`);
    res.json(await clientePorId(id));
});

rotas.get('/tabelas', exigirLogin, exigirAdmin, async (_req, res) => {
    const { rows } = await banco.query(
        `select t.codigo, t.nome, t.editada_em is not null as editada,
                (select count(*)::int from clientes c where c.tabela_codigo = t.codigo and not c.inativo) as clientes,
                (select count(*)::int from itens_tabela i where i.tabela_codigo = t.codigo) as itens
           from tabelas_erp t where t.nome is not null order by t.nome, t.codigo`,
    );
    res.json(rows);
});

rotas.get('/tabelas/:codigo/itens', exigirLogin, exigirAdmin, async (req, res) => {
    const codigo = codigoDaTabela(req.params.codigo);
    if (!codigo || !(await tabelaExiste(codigo))) {
        res.status(404).json({ erro: 'Tabela não encontrada.' });
        return;
    }
    const { rows } = await banco.query(
        `select p.codigo, p.descricao, p.unidade
           from itens_tabela i join produtos p on p.codigo = i.produto_codigo
          where i.tabela_codigo = $1 order by p.descricao, p.codigo`,
        [codigo],
    );
    res.json(rows);
});

// A tabela vale para todos os clientes que usam ela: a tela avisa quantos são antes de salvar.
rotas.put('/tabelas/:codigo/itens', exigirLogin, exigirAdmin, async (req, res) => {
    const codigo = codigoDaTabela(req.params.codigo);
    const { produtos } = (req.body ?? {}) as Record<string, unknown>;
    if (!Array.isArray(produtos) || produtos.length > 5000 || !produtos.every(p => typeof p === 'string' && p.length <= 40)) {
        res.status(400).json({ erro: 'Lista de produtos inválida.' });
        return;
    }
    if (!codigo || !(await tabelaExiste(codigo))) {
        res.status(404).json({ erro: 'Tabela não encontrada.' });
        return;
    }

    const conexao = await banco.connect();
    try {
        await conexao.query('begin');
        await conexao.query('delete from itens_tabela where tabela_codigo = $1', [codigo]);
        await conexao.query(
            `insert into itens_tabela (tabela_codigo, produto_codigo)
             select $1, p.codigo from produtos p where p.codigo = any($2::text[])`,
            [codigo, produtos],
        );
        await conexao.query('update tabelas_erp set editada_em = now() where codigo = $1', [codigo]);
        await conexao.query('commit');
    } catch (erro) {
        await conexao.query('rollback');
        throw erro;
    } finally {
        conexao.release();
    }
    await registrar(req, res, 'alterou tabela', `${codigo}: ${produtos.length} produtos`);
    res.status(204).end();
});

// Registro de auditoria: os 300 mais recentes.
rotas.get('/auditoria', exigirLogin, exigirAdmin, async (_req, res) => {
    const { rows } = await banco.query(
        'select id, quando, usuario, acao, detalhe, ip from auditoria order by quando desc, id desc limit 300',
    );
    res.json(rows);
});

// Busca para adicionar produto numa tabela: pelo nome ou pelo código, até 30 resultados.
rotas.get('/produtos', exigirLogin, exigirAdmin, async (req, res) => {
    const { busca } = req.query;
    if (typeof busca !== 'string' || busca.trim().length < 2 || busca.length > 60) {
        res.json([]);
        return;
    }
    const termo = `%${busca.trim().replace(/[\\%_]/g, '\\$&')}%`;
    const { rows } = await banco.query(
        `select codigo, descricao, unidade from produtos
          where descricao ilike $1 or codigo ilike $1 order by descricao, codigo limit 30`,
        [termo],
    );
    res.json(rows);
});

const USUARIO_VALIDO = /^[a-z0-9._-]{2,40}$/;
const MENSAGEM_USUARIO = 'O usuário precisa ter de 2 a 40 letras sem acento, números, ponto ou traço.';
const VIOLOU_UNICO = '23505';

const SELECT_CLIENTES = `
    select c.id, c.codigo, c.nome, c.cidade, c.uf, c.tabela_codigo as "codigoTabela", t.nome as tabela,
           c.representante_id as "representanteId", c.editado_em is not null as editado, c.inativo
      from clientes c join tabelas_erp t on t.codigo = c.tabela_codigo`;

// O representante só vê os ativos; o admin vê também os inativos, para reativar.
async function clientesDoRepresentante(id: number | null, comInativos = false) {
    const { rows } = await banco.query(
        `${SELECT_CLIENTES} where c.representante_id = $1 and ($2 or not c.inativo) order by c.nome`, [id, comInativos],
    );
    return rows;
}

async function clientePorId(id: number | null) {
    const { rows: [cliente] } = await banco.query(`${SELECT_CLIENTES} where c.id = $1`, [id]);
    return cliente;
}

// "PRI-155", "MGA-10": o que não tem esse formato vira null (404), sem chegar ao banco.
function codigoDaTabela(valor: string | string[]): string | null {
    return typeof valor === 'string' && /^[A-Z]{2,3}-\d{1,9}$/.test(valor) ? valor : null;
}

// Só tabela com nome: as sem nome ficam só para conferência.
async function tabelaExiste(codigo: string): Promise<boolean> {
    const { rowCount } = await banco.query('select 1 from tabelas_erp where codigo = $1 and nome is not null', [codigo]);
    return rowCount === 1;
}

interface DadosCliente {
    representanteId: number;
    nome: string;
    cidade: string;
    uf: string;
    codigoTabela: string;
}

/** Dados do cliente já limpos e conferidos no banco (representante e tabela existem), ou a mensagem do erro. */
async function dadosDoCliente(corpo: unknown): Promise<DadosCliente | string> {
    const { representanteId, nome, cidade, uf, codigoTabela } = (corpo ?? {}) as Record<string, unknown>;
    if (typeof nome !== 'string' || !nome.trim() || nome.length > 120) return 'Informe o nome (até 120 caracteres).';
    if (typeof cidade !== 'string' || cidade.length > 80) return 'Informe a cidade (até 80 caracteres).';
    if (typeof uf !== 'string' || !/^([A-Za-z]{2})?$/.test(uf.trim())) return 'UF inválida (2 letras).';
    const codigo = typeof codigoTabela === 'string' ? codigoDaTabela(codigoTabela) : null;
    if (!codigo || !(await tabelaExiste(codigo))) return 'Escolha uma tabela de preço.';
    const { rowCount } = await banco.query('select 1 from representantes where id = $1', [idDaRota(String(representanteId))]);
    if (!rowCount) return 'Escolha o representante.';
    return {
        representanteId: Number(representanteId), nome: nome.trim(), cidade: cidade.trim(), uf: uf.trim().toUpperCase(), codigoTabela: codigo,
    };
}

// Id que não é inteiro positivo vira null: a busca não acha nada (404), em vez de erro do Postgres (500).
function idDaRota(valor: string | string[]): number | null {
    return typeof valor === 'string' && /^\d{1,9}$/.test(valor) ? Number(valor) : null;
}

/** Nome, usuário (login) e admin já limpos, ou a mensagem do que está errado. */
function dadosDoUsuario(corpo: unknown): { nome: string; usuario: string; admin: boolean } | string {
    const { nome, usuario, admin } = (corpo ?? {}) as Record<string, unknown>;
    if (typeof nome !== 'string' || !nome.trim() || nome.length > 120) return 'Informe o nome (até 120 caracteres).';
    const login = typeof usuario === 'string' ? usuario.trim().toLowerCase() : '';
    if (!USUARIO_VALIDO.test(login)) return MENSAGEM_USUARIO;
    return { nome: nome.trim(), usuario: login, admin: admin === true };
}
