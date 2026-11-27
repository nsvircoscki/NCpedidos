// Troca a senha dos representantes (não mexe nos admins) por uma nova no padrão da empresa ("NcRafael4821").
// Uso: npm run novas-senhas                 (todos os representantes)
//      npm run novas-senhas -- --usuario rafael   (só um)
// A senha é provisória: no primeiro login a pessoa cria a sua.
// As senhas novas vão para senhas-novos-usuarios.txt (fora do git): passe a cada um e apague o arquivo.
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { banco } from '../src/banco.js';
import { trocarSenha } from '../src/login.js';
import { senhaDaEmpresa } from '../src/senhas.js';

const ARQUIVO_SENHAS = 'senhas-novos-usuarios.txt';
const { values } = parseArgs({ options: { usuario: { type: 'string' } } });

const { rows: usuarios } = await banco.query<{ id: number; nome: string; usuario: string }>(
    'select id, nome, usuario from representantes where not admin and ($1::text is null or usuario = lower($1)) order by nome',
    [values.usuario ?? null],
);
if (!usuarios.length) {
    console.error(values.usuario ? `Usuário ${values.usuario} não existe (ou é admin).` : 'Nenhum representante cadastrado.');
    process.exit(1);
}

const linhas: string[] = [];
for (const { id, nome, usuario } of usuarios) {
    const senha = senhaDaEmpresa(nome);
    await trocarSenha(id, senha, true);
    linhas.push(`${nome}; usuário ${usuario}; senha ${senha}`);
}
writeFileSync(ARQUIVO_SENHAS, `${linhas.join('\n')}\n`);
console.log(`${usuarios.length} senhas trocadas. Estão em ${ARQUIVO_SENHAS}.`);
await banco.end();
