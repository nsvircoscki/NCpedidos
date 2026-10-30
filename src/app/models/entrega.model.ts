export interface Entrega {
    horario: string;
    cliente: string;
    endereco: string;
    status: 'Em rota' | 'Preparando' | 'Aguardando' | 'Agendada';
    cor: 'azul' | 'amarelo' | 'cinza';
}