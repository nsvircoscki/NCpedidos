import { ProdutoDaTabela } from '../models/pedido-rapido.model';
import { filtrarPorTexto, semAcento } from './texto';

/** Pedido em andamento guardado no navegador (um por usuário). Vale só até sair ou entrar de novo. */
export const PREFIXO_RASCUNHO = 'rascunho-pedido-';

/** Número pela data e hora (AAAAMMDD-HHMM): sem gravar pedido, é o que garante que não se repete. */
export function numeroDoPedido(data: Date): string {
    const doisDigitos = (valor: number) => String(valor).padStart(2, '0');
    const dia = `${data.getFullYear()}${doisDigitos(data.getMonth() + 1)}${doisDigitos(data.getDate())}`;
    return `${dia}-${doisDigitos(data.getHours())}${doisDigitos(data.getMinutes())}`;
}

/** "Casa Almeida & Cia" → pedido-casa-almeida-cia-20261126-1432.pdf (sem acento nem espaço, para o WhatsApp). */
export function nomeDoArquivo(cliente: string, numero: string): string {
    const clienteNoNome = semAcento(cliente).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `pedido-${clienteNoNome || 'cliente'}-${numero}.pdf`;
}

/** Busca por descrição ou código, sem diferença de maiúscula ou acento. */
export function filtrarProdutos(produtos: ProdutoDaTabela[], termo: string): ProdutoDaTabela[] {
    return filtrarPorTexto(produtos, termo, produto => `${produto.descricao} ${produto.codigo}`);
}

/**
 * Quantidades por linha do pedido. A chave é o código do produto; o produto de desenvolvimento
 * pode entrar várias vezes, uma por descrição, com a chave "DESENV#1", "DESENV#2"...
 */
export type Quantidades = Record<string, number>;

/** Descrições digitadas por chave de linha (só nas linhas de desenvolvimento). */
export type Descricoes = Record<string, string>;

export type LinhaDoPedido = ProdutoDaTabela & { chave: string };

export function totalDeUnidades(quantidades: Quantidades): number {
    return Object.values(quantidades).reduce((soma, quantidade) => soma + quantidade, 0);
}

/** Próxima chave livre para mais um produto de desenvolvimento: "DESENV#1", "DESENV#2"... */
export function novaChave(codigo: string, quantidades: Quantidades): string {
    const usados = Object.keys(quantidades).filter(chave => chave.startsWith(`${codigo}#`)).map(chave => Number(chave.split('#')[1]));
    return `${codigo}#${Math.max(0, ...usados) + 1}`;
}

/** Linhas do pedido na ordem da tabela, só as que têm quantidade. */
export function linhasDoPedido(produtos: ProdutoDaTabela[], quantidades: Quantidades): LinhaDoPedido[] {
    return produtos.flatMap(produto => {
        const chaves = produto.pedeDescricao
            ? Object.keys(quantidades).filter(chave => chave.startsWith(`${produto.codigo}#`)).sort((a, b) => numeroDaChave(a) - numeroDaChave(b))
            : [produto.codigo];
        return chaves.filter(chave => quantidades[chave] > 0).map(chave => ({ ...produto, chave }));
    });
}

/** Itens que vão para o PDF: o produto de desenvolvimento leva a descrição no nome. */
export function itensDoPedido(produtos: ProdutoDaTabela[], quantidades: Quantidades, descricoes: Descricoes = {}) {
    return linhasDoPedido(produtos, quantidades).map(({ chave, pedeDescricao, ...produto }) => {
        const descricao = descricoes[chave]?.trim();
        return {
            ...produto,
            descricao: pedeDescricao && descricao ? `${produto.descricao}: ${descricao}` : produto.descricao,
            quantidade: quantidades[chave],
        };
    });
}

/** Alguma linha de desenvolvimento no pedido ainda está sem descrição? */
export function faltamDescricoes(produtos: ProdutoDaTabela[], quantidades: Quantidades, descricoes: Descricoes): boolean {
    return linhasDoPedido(produtos, quantidades).some(linha => linha.pedeDescricao && !descricoes[linha.chave]?.trim());
}

function numeroDaChave(chave: string): number {
    return Number(chave.split('#')[1]);
}

