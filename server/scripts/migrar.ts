// Roda, em ordem, os arquivos de migracoes/ que ainda não rodaram neste banco.
// Uso: npm run migrar
import { readdirSync, readFileSync } from 'node:fs';
import { banco } from '../src/banco.js';

const PASTA = new URL('../migracoes/', import.meta.url);

await banco.query('create table if not exists migracoes (nome text primary key, rodada_em timestamptz not null default now())');
const { rows } = await banco.query<{ nome: string }>('select nome from migracoes');
const jaRodadas = new Set(rows.map(linha => linha.nome));

for (const nome of readdirSync(PASTA).filter(arquivo => arquivo.endsWith('.sql')).sort()) {
    if (jaRodadas.has(nome)) continue;
    const cliente = await banco.connect();
    try {
        await cliente.query('begin');
        await cliente.query(readFileSync(new URL(nome, PASTA), 'utf8'));
        await cliente.query('insert into migracoes (nome) values ($1)', [nome]);
        await cliente.query('commit');
        console.log(`Migração ${nome} aplicada.`);
    } catch (erro) {
        await cliente.query('rollback');
        throw erro;
    } finally {
        cliente.release();
    }
}

console.log('Banco atualizado.');
await banco.end();
