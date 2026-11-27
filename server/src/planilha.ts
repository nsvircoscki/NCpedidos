// Planilha "Clientes 12 meses - importação", exportada do ERP Bem-Empresa: abas Clientes, Tabelas e
// Produtos da tabela. Cada aba chega como lista de linhas; a linha 0 é o cabeçalho.
// Códigos levam a sigla da base: PRI (Principal), MG (Minas), AST (Asterisco), MGA (Minas Asterisco).

const RECEPCAO = '500';
// Aparecem como representante no ERP, mas não são pessoas: os clientes deles não vão para ninguém.
const SEM_REPRESENTANTE = new Set(['', 'INATIVO', 'DIRETO']);

export interface ClienteErp {
    codigo: string;
    nome: string;
    cidade: string;
    uf: string;
    tabela: string;
    representante: RepresentanteErp;
}

export interface RepresentanteErp {
    /** Sigla da base + código do representante no ERP ("PRI-65"). Cada comissão tem um código. */
    codigo: string;
    /** Nome sem o prefixo da comissão: "5 - RAFAEL BENEDET" vira "RAFAEL BENEDET". */
    nome: string;
}

export interface ClientesErp {
    clientes: ClienteErp[];
    /** Clientes sem tabela válida no cadastro, que ficaram com a RECEPCAO. */
    naRecepcao: string[];
    rejeitados: string[];
}

/**
 * Aba "Clientes": cada cliente com o representante do cadastro e a tabela.
 * `tabelas` são as que dá para usar (com nome e produtos). Sem uma delas, o cliente fica com a RECEPCAO
 * da mesma base; a base que não tem RECEPCAO usa a da Principal.
 */
export function lerClientesErp(linhas: unknown[][], tabelas: Set<string>): ClientesErp {
    const [cabecalho, ...clientes] = linhas;
    const colunas = indicesDasColunas(cabecalho, [
        'Cód. cliente', 'Nome', 'Cidade', 'UF', 'Bloqueado', 'Cód. repres. (cadastro)', 'Representante (cadastro)',
        'Cód. tabela (cadastro)',
    ]);
    const resultado: ClientesErp = { clientes: [], naRecepcao: [], rejeitados: [] };

    for (const linha of clientes) {
        const [codigo, nome, cidade, uf, bloqueado, codigoDono, dono, doCadastro] = colunas.map(indice => texto(linha[indice]));
        if (!codigo) continue;
        const base = codigo.split('-')[0];
        const representante = { codigo: `${base}-${codigoDono}`, nome: nomeDoRepresentante(dono) };
        if (!codigoDono || SEM_REPRESENTANTE.has(representante.nome)) {
            resultado.rejeitados.push(`${codigo} ${nome}: sem representante (${representante.nome || 'vazio'})`);
            continue;
        }
        if (bloqueado === 'T') {
            resultado.rejeitados.push(`${codigo} ${nome}: bloqueado no ERP`);
            continue;
        }
        const tabela = [doCadastro, `${base}-${RECEPCAO}`, `PRI-${RECEPCAO}`].find(opcao => tabelas.has(opcao));
        if (!tabela) {
            resultado.rejeitados.push(`${codigo} ${nome}: sem tabela e sem a da recepção`);
            continue;
        }
        if (tabela !== doCadastro) resultado.naRecepcao.push(`${codigo} ${nome}: tabela ${doCadastro || 'vazia'}, ficou com ${tabela}`);
        resultado.clientes.push({ codigo, nome, cidade, uf, tabela, representante });
    }
    return resultado;
}

/**
 * Login de cada representante: o primeiro nome ("rafael"). Quando dois começam igual (WILSON SP e WILSON MG),
 * os dois usam o nome inteiro com ponto ("wilson.sp", "wilson.mg").
 */
export function usuariosDosRepresentantes(nomes: string[]): Map<string, string> {
    const partes = new Map(nomes.map(nome => [nome, semAcento(nome).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ')]));
    const primeiros = [...partes.values()].map(([primeiro]) => primeiro);
    return new Map([...partes].map(([nome, [primeiro, ...resto]]) => [
        nome,
        primeiros.filter(outro => outro === primeiro).length > 1 ? [primeiro, ...resto].join('.') : primeiro,
    ]));
}

export interface TabelaErp {
    codigo: string;
    /** Vazio quando o ERP não tem nome: a tabela fica só para conferência. */
    nome: string;
    base: string;
    codigoErp: string;
}

export interface ProdutoErp {
    codigo: string;
    descricao: string;
    unidade: string;
}

export interface ProdutosErp {
    /** Código do produto → produto, com o nome escolhido pela regra da Principal. */
    produtos: Map<string, ProdutoErp>;
    /** Código da tabela → códigos dos produtos dela. */
    itens: Map<string, string[]>;
    rejeitadas: { tabela: string; descricao: string }[];
}



/** Aba "Tabelas": todas, inclusive as sem nome (essas ficam só para conferência). */
export function lerTabelasErp(linhas: unknown[][]): TabelaErp[] {
    const [cabecalho, ...tabelas] = linhas;
    const colunas = indicesDasColunas(cabecalho, ['Cód. tabela', 'Tabela', 'Base no ERP', 'Cód. tabela no ERP']);
    return tabelas
        .map(linha => colunas.map(indice => texto(linha[indice])))
        .filter(([codigo]) => codigo)
        .map(([codigo, nome, base, codigoErp]) => ({ codigo, nome, base, codigoErp }));
}

/**
 * Aba "Produtos da tabela". O mesmo código pode vir com nomes diferentes em cada tabela:
 * vale o primeiro nome de uma tabela da Principal; sem Principal, o primeiro que aparecer.
 */
export function lerProdutosErp(linhas: unknown[][]): ProdutosErp {
    const [cabecalho, ...vinculos] = linhas;
    const colunas = indicesDasColunas(cabecalho, ['Cód. tabela', 'Cód. produto', 'Produto', 'Unidade']);
    const produtos = new Map<string, ProdutoErp>();
    const nomeDaPrincipal = new Set<string>();
    const itens = new Map<string, string[]>();
    const rejeitadas: ProdutosErp['rejeitadas'] = [];

    vinculos.forEach((linha, indice) => {
        const [tabela, codigo, descricao, unidade] = colunas.map(coluna => texto(linha[coluna]));
        if (!tabela || !codigo) return;
        if (!descricao) {
            rejeitadas.push({ tabela, descricao: `linha ${indice + 2}: produto ${codigo} sem cadastro` });
            return;
        }
        const daTabela = itens.get(tabela) ?? [];
        daTabela.push(codigo);
        itens.set(tabela, daTabela);

        const daPrincipal = tabela.startsWith('PRI-');
        if (!produtos.has(codigo) || (daPrincipal && !nomeDaPrincipal.has(codigo))) {
            produtos.set(codigo, { codigo, descricao, unidade });
            if (daPrincipal) nomeDaPrincipal.add(codigo);
        }
    });
    return { produtos, itens, rejeitadas };
}

// Códigos como "1002.20" e "0000010" já chegam como texto; número vira texto sem perder nada.
function texto(valor: unknown): string {
    return valor === null || valor === undefined ? '' : String(valor).trim();
}

export function semAcento(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// "5 - RAFAEL  BENEDET" e "RAFAEL BENEDET" são a mesma pessoa no ERP (um código por comissão).
function nomeDoRepresentante(nome: string): string {
    return nome.replace(/^\d+\s*-\s*/, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

// Acha a coluna pelo nome do cabeçalho: a próxima exportação pode vir com as colunas em outra ordem.
function indicesDasColunas(cabecalho: unknown[] = [], nomes: string[]): number[] {
    return nomes.map(nome => {
        const indice = cabecalho.findIndex(celula => texto(celula) === nome);
        if (indice < 0) throw new Error(`Coluna "${nome}" não encontrada na planilha.`);
        return indice;
    });
}
