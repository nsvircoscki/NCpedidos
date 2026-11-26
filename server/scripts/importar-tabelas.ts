// Importa as planilhas "Tabela de Preço" do ERP de um representante (uma planilha por cliente).
// Uso: npm run importar-tabelas -- --email narciso@nctintas.com.br --pasta ../narciso
// Rodar de novo atualiza: o cliente é achado pelo código da tabela e os produtos dele são trocados.
import ExcelJS from 'exceljs';
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseArgs } from 'node:util';
import { banco } from '../src/banco.js';
import { lerTabelaCliente, type TabelaCliente } from '../src/planilha.js';

// Planilhas de teste ou que não são de cliente (decisão de quem desenvolve).
const IGNORAR = new Set(['aaa', 'errado']);

const { values } = parseArgs({ options: { email: { type: 'string' }, pasta: { type: 'string' } } });
if (!values.email || !values.pasta) {
    console.error('Uso: npm run importar-tabelas -- --email email@empresa.com.br --pasta ../narciso');
    process.exit(1);
}

const { rows: [representante] } = await banco.query<{ id: number }>(
    'select id from representantes where lower(email) = lower($1)', [values.email.trim()],
);
if (!representante) {
    console.error(`Representante ${values.email} não existe. Crie antes com npm run criar-representante.`);
    process.exit(1);
}

const tabelas: TabelaCliente[] = [];
const ignoradas: string[] = [];
for (const arquivo of readdirSync(values.pasta).filter(nome => nome.toLowerCase().endsWith('.xlsx')).sort()) {
    const nome = basename(arquivo, '.xlsx');
    if (IGNORAR.has(nome.toLowerCase())) {
        ignoradas.push(`${nome} (lista de ignorados)`);
        continue;
    }
    try {
        const tabela = lerTabelaCliente(await lerLinhas(join(values.pasta, arquivo)));
        if (tabela.itens.length) tabelas.push(tabela);
        else ignoradas.push(`${nome} (sem produtos)`);
    } catch (erro) {
        ignoradas.push(`${nome} (${(erro as Error).message})`);
    }
}

const cliente = await banco.connect();
try {
    await cliente.query('begin');
    for (const tabela of tabelas) {
        for (const item of tabela.itens) {
            await cliente.query(
                `insert into produtos (codigo, descricao, unidade) values ($1, $2, $3)
                 on conflict (codigo) do update set descricao = excluded.descricao, unidade = excluded.unidade`,
                [item.codigo, item.descricao, item.unidade],
            );
        }
        const { rows: [{ id }] } = await cliente.query<{ id: number }>(
            `insert into clientes (representante_id, nome, codigo_tabela, tabela_emitida_em) values ($1, $2, $3, $4)
             on conflict (representante_id, codigo_tabela)
             do update set nome = excluded.nome, tabela_emitida_em = excluded.tabela_emitida_em
             returning id`,
            [representante.id, tabela.cliente, tabela.codigoTabela, tabela.emitidaEm],
        );
        await cliente.query('delete from itens_tabela where cliente_id = $1', [id]);
        await cliente.query(
            `insert into itens_tabela (cliente_id, produto_codigo, preco)
             select $1, codigo, preco from unnest($2::text[], $3::numeric[]) as item(codigo, preco)
             on conflict (cliente_id, produto_codigo) do update set preco = excluded.preco`,
            [id, tabela.itens.map(item => item.codigo), tabela.itens.map(item => item.preco)],
        );
    }
    await cliente.query('commit');
} catch (erro) {
    await cliente.query('rollback');
    throw erro;
} finally {
    cliente.release();
}

const produtos = new Set(tabelas.flatMap(tabela => tabela.itens.map(item => item.codigo)));
console.log(`${tabelas.length} clientes e ${produtos.size} produtos importados para ${values.email}.`);
if (ignoradas.length) console.log(`Ignoradas (${ignoradas.length}):\n  ${ignoradas.join('\n  ')}`);
await banco.end();

// A planilha vira uma lista de linhas, começando em 0, com o valor de cada célula.
async function lerLinhas(caminho: string): Promise<unknown[][]> {
    const livro = new ExcelJS.Workbook();
    await livro.xlsx.readFile(caminho);
    const linhas: unknown[][] = [];
    livro.worksheets[0]?.eachRow({ includeEmpty: true }, (linha, numero) => {
        const valores = (linha.values as ExcelJS.CellValue[]).slice(1);
        linhas[numero - 1] = valores.map(valorDaCelula);
    });
    return Array.from(linhas, linha => linha ?? []);
}

function valorDaCelula(valor: ExcelJS.CellValue): unknown {
    if (valor && typeof valor === 'object') {
        if ('result' in valor) return valor.result;
        if ('richText' in valor) return valor.richText.map(parte => parte.text).join('');
        if ('text' in valor) return valor.text;
    }
    return valor;
}
