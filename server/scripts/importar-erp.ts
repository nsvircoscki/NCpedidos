// Importa do ERP as tabelas de preço e os clientes de todos os representantes.
// Uso: npm run importar-erp   (outra planilha: -- --planilha caminho.xlsx)
// O cliente vai para o usuário ligado ao código do representante no ERP ("PRI-65"). Representante sem usuário
// ganha um: login pelo primeiro nome e senha no padrão da empresa, gravada em senhas-novos-usuarios.txt (fora do git).
// Representante cujo usuário o admin excluiu não volta, nem os clientes dele.
// Rodar de novo atualiza sem duplicar. O que o admin editou na tela (cliente ou itens de tabela) fica como ele deixou.
import bcrypt from 'bcryptjs';
import { appendFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { banco } from '../src/banco.js';
import { lerClientesErp, lerProdutosErp, lerTabelasErp, usuariosDosRepresentantes } from '../src/planilha.js';
import { senhaDaEmpresa } from '../src/senhas.js';
import { lerAbas } from './ler-planilha.js';

const ARQUIVO_SENHAS = 'senhas-novos-usuarios.txt';
const { values } = parseArgs({
    options: { planilha: { type: 'string', default: '../INFORMAÇÕES/Clientes 12 meses - importação.xlsx' } },
});

const [linhasClientes, linhasTabelas, linhasProdutos] = await lerAbas(values.planilha, ['Clientes', 'Tabelas', 'Produtos da tabela']);
const tabelas = lerTabelasErp(linhasTabelas);
const { produtos, itens, rejeitadas } = lerProdutosErp(linhasProdutos);
const usaveis = tabelas.filter(tabela => tabela.nome && itens.get(tabela.codigo)?.length);
const { clientes, naRecepcao, rejeitados } = lerClientesErp(linhasClientes, new Set(usaveis.map(tabela => tabela.codigo)));

const { rows: editadas } = await banco.query<{ codigo: string }>('select codigo from tabelas_erp where editada_em is not null');
const tabelasEditadas = new Set(editadas.map(tabela => tabela.codigo));
const atualizar = usaveis.filter(tabela => !tabelasEditadas.has(tabela.codigo));
const pares = atualizar.flatMap(tabela => (itens.get(tabela.codigo) ?? []).map(produto => [tabela.codigo, produto]));

// Código do representante no ERP → nome; cada nome é uma pessoa, com um ou mais códigos.
const representantes = new Map(clientes.map(({ representante }) => [representante.codigo, representante.nome]));
const novos: { nome: string; usuario: string; senha: string }[] = [];

const conexao = await banco.connect();
try {
    await conexao.query('begin');
    await conexao.query(
        `insert into tabelas_erp (codigo, nome, base, codigo_erp)
         select * from unnest($1::text[], $2::text[], $3::text[], $4::text[])
         on conflict (codigo) do update set nome = excluded.nome, base = excluded.base, codigo_erp = excluded.codigo_erp`,
        [tabelas.map(t => t.codigo), tabelas.map(t => t.nome || null), tabelas.map(t => t.base), tabelas.map(t => t.codigoErp)],
    );
    const listaProdutos = [...produtos.values()];
    await conexao.query(
        `insert into produtos (codigo, descricao, unidade)
         select * from unnest($1::text[], $2::text[], $3::text[])
         on conflict (codigo) do update set descricao = excluded.descricao, unidade = excluded.unidade`,
        [listaProdutos.map(p => p.codigo), listaProdutos.map(p => p.descricao), listaProdutos.map(p => p.unidade)],
    );
    await conexao.query('delete from itens_tabela where tabela_codigo = any($1::text[])', [atualizar.map(t => t.codigo)]);
    await conexao.query(
        `insert into itens_tabela (tabela_codigo, produto_codigo)
         select * from unnest($1::text[], $2::text[]) on conflict do nothing`,
        [pares.map(([tabela]) => tabela), pares.map(([, produto]) => produto)],
    );

    // Usuário de cada representante: o já ligado a um código dele ou a um código com o mesmo nome; senão, um novo.
    // Ligado a null: o admin excluiu o usuário, então o representante fica de fora.
    const { rows: ligados } = await conexao.query<{ codigo: string; nome: string; representante_id: number | null }>(
        'select codigo, nome, representante_id from representantes_erp',
    );
    const usuarioDoNome = new Map(ligados.map(ligado => [ligado.nome, ligado.representante_id]));
    for (const ligado of ligados) if (representantes.has(ligado.codigo)) usuarioDoNome.set(representantes.get(ligado.codigo)!, ligado.representante_id);

    const nomes = [...new Set(representantes.values())];
    const logins = usuariosDosRepresentantes(nomes);
    for (const nome of nomes.filter(nome => !usuarioDoNome.has(nome))) {
        const senha = senhaDaEmpresa(nomeProprio(nome));
        const usuario = await loginLivre(logins.get(nome)!);
        const { rows: [{ id }] } = await conexao.query<{ id: number }>(
            'insert into representantes (nome, usuario, senha_hash, trocar_senha) values ($1, $2, $3, true) returning id',
            [nomeProprio(nome), usuario, await bcrypt.hash(senha, 10)],
        );
        usuarioDoNome.set(nome, id);
        novos.push({ nome: nomeProprio(nome), usuario, senha });
    }
    const codigos = [...representantes.keys()];
    await conexao.query(
        `insert into representantes_erp (codigo, nome, representante_id)
         select * from unnest($1::text[], $2::text[], $3::int[]) on conflict (codigo) do nothing`,
        [codigos, codigos.map(codigo => representantes.get(codigo)), codigos.map(codigo => usuarioDoNome.get(representantes.get(codigo)!))],
    );

    // Cliente do ERP que saiu da planilha some; o cadastrado ou editado pelo admin fica.
    await conexao.query(
        'delete from clientes where codigo is not null and editado_em is null and codigo <> all($1::text[])',
        [clientes.map(c => c.codigo)],
    );
    await conexao.query(
        `insert into clientes (codigo, representante_id, nome, cidade, uf, tabela_codigo)
         select novos.codigo, r.representante_id, novos.nome, novos.cidade, novos.uf, novos.tabela
           from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
             as novos (codigo, representante, nome, cidade, uf, tabela)
           join representantes_erp r on r.codigo = novos.representante
          where r.representante_id is not null
         on conflict (codigo) do update set representante_id = excluded.representante_id, nome = excluded.nome,
            cidade = excluded.cidade, uf = excluded.uf, tabela_codigo = excluded.tabela_codigo
         where clientes.editado_em is null`,
        (['codigo', 'representante', 'nome', 'cidade', 'uf', 'tabela'] as const)
            .map(campo => clientes.map(c => (campo === 'representante' ? c.representante.codigo : c[campo]))),
    );
    await conexao.query('commit');
} catch (erro) {
    await conexao.query('rollback');
    throw erro;
} finally {
    conexao.release();
}

if (novos.length) {
    appendFileSync(ARQUIVO_SENHAS, novos.map(({ nome, usuario, senha }) => `${nome}; usuário ${usuario}; senha ${senha}\n`).join(''));
}
const { rows: porUsuario } = await banco.query<{ usuario: string; clientes: number }>(
    `select r.usuario, count(c.id)::int as clientes from representantes r join clientes c on c.representante_id = r.id
      where not c.inativo group by r.usuario order by r.usuario`,
);

console.log(`Tabelas: ${atualizar.length} atualizadas (${tabelas.length} na planilha), ${pares.length} itens, ${produtos.size} produtos.`);
if (tabelasEditadas.size) console.log(`Tabelas editadas pelo admin, sem mudança: ${[...tabelasEditadas].join(', ')}.`);
console.log(`Clientes por usuário: ${porUsuario.map(({ usuario, clientes }) => `${usuario} ${clientes}`).join(', ')}.`);
if (novos.length) console.log(`Usuários novos (${novos.length}): ${novos.map(n => n.usuario).join(', ')}. Senhas em ${ARQUIVO_SENHAS}.`);
if (naRecepcao.length) console.log(`Com a tabela da recepção (${naRecepcao.length}):\n  ${naRecepcao.join('\n  ')}`);
console.log(`Clientes de fora: ${resumo(rejeitados)}.`);
if (rejeitadas.length) console.log(`Linhas de produto sem cadastro: ${rejeitadas.length}.`);
await banco.end();

// O login já existe (de outra pessoa ou de teste)? Ganha um número: "rafael2".
async function loginLivre(desejado: string): Promise<string> {
    for (let numero = 1; ; numero++) {
        const usuario = numero === 1 ? desejado : `${desejado}${numero}`;
        const { rowCount } = await conexao.query('select 1 from representantes where usuario = $1', [usuario]);
        if (!rowCount) return usuario;
    }
}

function nomeProprio(nome: string): string {
    return nome.toLowerCase().replace(/(^|\s)\S/g, letra => letra.toUpperCase());
}

// "PRI-8 X: sem representante (INATIVO)" → conta por motivo, para a lista não ter centenas de linhas.
function resumo(motivos: string[]): string {
    const contagem = new Map<string, number>();
    for (const motivo of motivos) {
        const chave = motivo.slice(motivo.lastIndexOf(': ') + 2);
        contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    }
    return [...contagem].map(([motivo, total]) => `${total} ${motivo}`).join(', ') || 'nenhum';
}
