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



