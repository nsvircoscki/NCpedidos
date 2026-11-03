export type StatusProduto = 'ATIVO' | 'INATIVO';

export interface Produto {
    id: number;
    nome: string;
    codigoSKU: string;
    descricao: string;
    categoria: string;
    embalagem: string;
    estoque: number;
    preco: number;
    margem: number;
    status: StatusProduto;
    cor: string;
}