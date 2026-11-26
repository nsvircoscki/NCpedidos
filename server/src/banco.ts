import 'dotenv/config';
import pg from 'pg';

export const banco = new pg.Pool({ connectionString: obrigatoria('DATABASE_URL') });

export function obrigatoria(nome: string): string {
    const valor = process.env[nome];
    if (!valor) throw new Error(`Variável de ambiente ${nome} não definida (veja server/.env.example).`);
    return valor;
}
