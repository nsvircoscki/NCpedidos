// Cria um representante ou troca a senha de um que já existe.
// Uso: npm run criar-representante -- --nome "Narciso" --usuario narciso
// Com --admin, o usuário cadastra os outros pela tela Usuários (use para criar o primeiro administrador).
// A senha é pedida no terminal, para não ficar no histórico de comandos.
import bcrypt from 'bcryptjs';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { banco } from '../src/banco.js';

const { values } = parseArgs({ options: { nome: { type: 'string' }, usuario: { type: 'string' }, admin: { type: 'boolean' } } });
if (!values.nome || !values.usuario) {
    console.error('Uso: npm run criar-representante -- --nome "Nome" --usuario nome');
    process.exit(1);
}

const senha = process.env['SENHA_REPRESENTANTE'] ?? (await perguntarSenha());
if (senha.length < 8) {
    console.error('A senha precisa ter pelo menos 8 caracteres.');
    process.exit(1);
}

await banco.query(
    `insert into representantes (nome, usuario, senha_hash, admin) values ($1, lower($2), $3, $4)
     on conflict (usuario) do update set nome = excluded.nome, senha_hash = excluded.senha_hash, admin = excluded.admin,
                   trocar_senha = false, sessao_desde = date_trunc('second', now())`,
    [values.nome, values.usuario.trim(), await bcrypt.hash(senha, 10), values.admin === true],
);
console.log(`${values.admin ? 'Administrador' : 'Representante'} ${values.nome} (usuário ${values.usuario}) pronto.`);
await banco.end();

async function perguntarSenha(): Promise<string> {
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    const resposta = await terminal.question('Senha (mínimo 8 caracteres): ');
    terminal.close();
    return resposta;
}
