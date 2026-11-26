/** Cliente do representante: cada um tem a própria tabela de preço no ERP. */
export interface ClienteDoRepresentante {
    id: number;
    nome: string;
    codigoTabela: string;
}

/** Produto da tabela do cliente. Sem preço: o MVP não mostra preço na tela nem no PDF. */
export interface ProdutoDaTabela {
    codigo: string;
    descricao: string;
    unidade: string;
    /** Produto de desenvolvimento: sem código no ERP, o representante descreve o que precisa. */
    pedeDescricao?: boolean;
}

export interface ItemPedidoRapido extends ProdutoDaTabela {
    quantidade: number;
}

/** Pedido do sistema provisório: não é gravado, vira um PDF que os funcionários lançam no ERP. */
export interface PedidoRapido {
    numero: string;
    emitidoEm: Date;
    representante: string;
    /** Nome digitado pelo representante (por enquanto não vem do ERP). */
    cliente: string;
    /** Tabela de preço escolhida: a planilha do ERP, com o nome e o código dela. */
    tabela: ClienteDoRepresentante;
    observacao: string;
    itens: ItemPedidoRapido[];
}
