// Cria um representante ou troca a senha de um que já existe.
// Uso: npm run criar-representante -- --nome "Narciso" --email narciso@nctintas.com.br
// Com --admin, o usuário cadastra os outros pela tela Usuários (use para criar o primeiro administrador).
// A senha é pedida no terminal, para não ficar no histórico de comandos.
import bcrypt from 'bcryptjs';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { banco } from '../src/banco.js';

const { values } = parseArgs({ options: { nome: { type: 'string' }, email: { type: 'string' }, admin: { type: 'boolean' } } });
if (!values.nome || !values.email) {
    console.error('Uso: npm run criar-representante -- --nome "Nome" --email email@empresa.com.br');
    process.exit(1);
}

const senha = process.env['SENHA_REPRESENTANTE'] ?? (await perguntarSenha());
if (senha.length < 8) {
    console.error('A senha precisa ter pelo menos 8 caracteres.');
    process.exit(1);
}

await banco.query(
    `insert into representantes (nome, email, senha_hash, admin) values ($1, lower($2), $3, $4)
     on conflict (email) do update set nome = excluded.nome, senha_hash = excluded.senha_hash, admin = excluded.admin`,
    [values.nome, values.email.trim(), await bcrypt.hash(senha, 10), values.admin === true],
);
console.log(`${values.admin ? 'Administrador' : 'Representante'} ${values.nome} <${values.email}> pronto.`);
await banco.end();

async function perguntarSenha(): Promise<string> {
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    const resposta = await terminal.question('Senha (mínimo 8 caracteres): ');
    terminal.close();
    return resposta;
}
