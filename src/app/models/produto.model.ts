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
    precosPorCliente?: Record<string, number>;
    rendimento?: string;
    acabamento?: string;
    linha?: string;
    atualizadoEm?: string;
    estoqueReservado?: number;
    giro30Dias?: number;
    estoquePorDeposito?: {
        nome: string;
        localizacao: string;
        quantidade: number;
    }[];
    variacoes?: {
        nome: string;
        codigoSKU: string;
        embalagem: string;
        estoque: number;
        preco: number;
        corHex: string;
    }[];
}
