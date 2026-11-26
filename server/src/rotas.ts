import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { banco } from './banco.js';
import {
    bloqueadoPorTentativas, entrar, exigirAdmin, exigirLogin, limparTentativas, registrarTentativaErrada, senhaValida,
} from './login.js';

export const rotas = Router();

rotas.post('/auth/login', async (req, res) => {
    const ip = req.ip ?? '';
    if (bloqueadoPorTentativas(ip)) {
        res.status(429).json({ erro: 'Muitas tentativas. Espere 15 minutos.' });
        return;
    }

    const { email, senha } = req.body ?? {};
    const sessao = typeof email === 'string' && typeof senha === 'string' ? await entrar(email, senha) : null;
    if (!sessao) {
        registrarTentativaErrada(ip);
        res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        return;
    }
    limparTentativas(ip);
    res.json(sessao);
});

rotas.get('/clientes', exigirLogin, async (_req, res) => {
    const { rows } = await banco.query(
        `select id, nome, codigo_tabela as "codigoTabela"
           from clientes where representante_id = $1 order by nome`,
        [res.locals['representanteId']],
    );
    res.json(rows);
});

// Produto ainda sem código no ERP: entra em toda tabela e o representante descreve o que precisa.
// Fica aqui, e não no banco, para a reimportação das planilhas não apagar.
const PRODUTO_DESENVOLVIMENTO = { codigo: 'DESENV', descricao: 'PRODUTO DESENVOLVIMENTO', unidade: 'UN', pedeDescricao: true };

// Sem preço: o MVP não mostra preço na tela nem no PDF.
rotas.get('/clientes/:id/produtos', exigirLogin, async (req, res) => {
    const { rows: [cliente] } = await banco.query(
        'select id from clientes where id = $1 and representante_id = $2',
        [Number(req.params.id), res.locals['representanteId']],
    );
    if (!cliente) {
        res.status(404).json({ erro: 'Cliente não encontrado.' });
        return;
    }

    const { rows } = await banco.query(
        `select p.codigo, p.descricao, p.unidade
           from itens_tabela i join produtos p on p.codigo = i.produto_codigo
          where i.cliente_id = $1 order by p.descricao, p.codigo`,
        [cliente.id],
    );
    res.json([PRODUTO_DESENVOLVIMENTO, ...rows]);
});

rotas.get('/usuarios', exigirLogin, exigirAdmin, async (_req, res) => {
    const { rows } = await banco.query(
        `select r.id, r.nome, r.email, r.admin, count(c.id)::int as clientes
           from representantes r left join clientes c on c.representante_id = r.id
          group by r.id order by r.nome`,
    );
    res.json(rows);
});

rotas.post('/usuarios', exigirLogin, exigirAdmin, async (req, res) => {
    const { nome, email, senha, admin } = req.body ?? {};
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ erro: 'Informe nome e e-mail.' });
        return;
    }
    if (!senhaValida(senha)) {
        res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
        return;
    }

    const { rows: [criado] } = await banco.query(
        `insert into representantes (nome, email, senha_hash, admin) values ($1, lower($2), $3, $4)
         on conflict (email) do nothing
         returning id, nome, email, admin, 0 as clientes`,
        [nome.trim(), email.trim(), await bcrypt.hash(senha, 10), admin === true],
    );
    if (!criado) {
        res.status(409).json({ erro: 'Já existe um usuário com esse e-mail.' });
        return;
    }
    res.status(201).json(criado);
});

// O admin troca a senha de qualquer usuário (é o caminho do "esqueci minha senha" no MVP).
rotas.put('/usuarios/:id/senha', exigirLogin, exigirAdmin, async (req, res) => {
    const { senha } = req.body ?? {};
    if (!senhaValida(senha)) {
        res.status(400).json({ erro: 'A senha precisa ter pelo menos 8 caracteres.' });
        return;
    }
    const { rowCount } = await banco.query(
        'update representantes set senha_hash = $1 where id = $2',
        [await bcrypt.hash(senha, 10), Number(req.params.id)],
    );
    if (!rowCount) {
        res.status(404).json({ erro: 'Usuário não encontrado.' });
        return;
    }
    res.status(204).end();
});
