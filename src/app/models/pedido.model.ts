export interface ItemPedido {
    nome: string;
    produtoId: number;
    quantidade: number;
    precoUnitario: number;
    subtotal?: number; 
}

export interface Pedido {
    id?: number;
    clienteId: number;
    itens: ItemPedido[];
    valorTotal: number;
    dataCriacao: string | Date;
    status: 'PENDENTE' | 'APROVADO' | 'CANCELADO' | 'RASCUNHO';
}

/** Pedido como aparece nas listas (tela de Pedidos e dashboard). */
export interface PedidoResumo {
    id: number;
    clienteId: number;
    client: string;
    initials: string;
    avatar: 'blue' | 'orange';
    date: string;
    volumes: number;
    total: number;
    status: string;
}

export type StatusPedido = 'Em análise' | 'Aprovado' | 'Recusado' | 'Faturado';

export interface ItemPedidoDetalhado {
    nome: string;
    descricao: string;
    unidade: string;
    quantidade: number;
    precoUnitario: number;
}

/** Pedido completo: o que a aprovação mostra e o que vai no PDF para o cliente. */
export interface PedidoDetalhado extends PedidoResumo {
    status: StatusPedido;
    documentoCliente: string;
    cidade: string;
    uf: string;
    representante: string;
    pagamento: string;
    previsaoEntrega: string;
    observacao: string;
    itens: ItemPedidoDetalhado[];
    desconto: number;
    motivoRecusa?: string;
}
