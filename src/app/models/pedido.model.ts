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
