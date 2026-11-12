export interface Funcionalidade {
    titulo: string;
    descricao: string;
    rota: string;
    grupo: 'Visão geral' | 'Pedidos' | 'Produtos' | 'Clientes' | 'Sistema';
    palavrasChave: string[];
}
