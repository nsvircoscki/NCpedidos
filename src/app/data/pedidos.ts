import { PedidoResumo } from '../models/pedido.model';

export const PEDIDOS_EXEMPLO: PedidoResumo[] = [
    { id: 1047, clienteId: 1, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '16 set.', volumes: 8,  total: 3240.00, status: 'Faturado'  },
    { id: 1046, clienteId: 2, client: 'Distribuidora Norte',    initials: 'DN', avatar: 'orange', date: '15 set.', volumes: 12, total: 5870.50, status: 'Aprovado'  },
    { id: 1045, clienteId: 3, client: 'Materiais Construção RC', initials: 'MC', avatar: 'blue',  date: '14 set.', volumes: 5,  total: 1920.00, status: 'Em análise' },
    { id: 1044, clienteId: 4, client: 'Ferreira & Filhos Ltda', initials: 'FF', avatar: 'orange', date: '13 set.', volumes: 20, total: 9150.00, status: 'Faturado'  },
    { id: 1043, clienteId: 1, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '12 set.', volumes: 3,  total: 870.00,  status: 'Aprovado'  },
];
