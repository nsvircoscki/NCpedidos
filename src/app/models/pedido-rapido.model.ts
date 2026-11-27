/** Cliente do representante, com a tabela de preço do cadastro no ERP (ou a da recepção, quando não tem). */
export interface ClienteDoRepresentante {
    id: number;
    /** Código no ERP, com a sigla da base (ex.: AST-11). O cliente cadastrado pelo admin não tem. */
    codigo: string | null;
    nome: string;
    cidade: string;
    uf: string;
    codigoTabela: string;
    tabela: string;
    representanteId: number;
    /** Mudado pelo admin: a importação do ERP não mexe mais nele. */
    editado: boolean;
    /** Inativado pelo admin: some da lista do representante, mas pode ser reativado. */
    inativo: boolean;
}

/** O que o admin informa ao cadastrar ou editar um cliente (tela Clientes). */
export interface DadosCliente {
    representanteId: number;
    nome: string;
    cidade: string;
    uf: string;
    codigoTabela: string;
}

/** Tabela de preço do ERP na tela Tabelas: quantos clientes usam e quantos produtos tem. */
export interface TabelaDoErp {
    codigo: string;
    nome: string;
    clientes: number;
    itens: number;
    /** Itens mudados pelo admin: a importação do ERP não mexe mais nela. */
    editada: boolean;
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
    cliente: ClienteDoRepresentante;
    observacao: string;
    itens: ItemPedidoRapido[];
}
