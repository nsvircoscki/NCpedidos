import { PedidoDetalhado, StatusPedido } from '../../models/pedido.model';

export type EstadoEtapa = 'feita' | 'atual' | 'futura' | 'recusada';

export interface EtapaPedido {
    titulo: string;
    descricao: string;
    estado: EstadoEtapa;
    rotulo: string;
}

const ETAPAS = [
    { titulo: 'Pedido enviado', descricao: 'Recebemos o pedido.' },
    { titulo: 'Pedido em análise', descricao: 'Validação de preços, crédito e estoque.' },
    { titulo: 'Produção', descricao: 'Os produtos serão produzidos e preparados para envio.' },
    { titulo: 'Saiu para entrega', descricao: 'Você receberá os dados da entrega.' },
    { titulo: 'Entrega concluída', descricao: 'O pedido foi entregue com sucesso.'},
];

// Posição, na lista ETAPAS, da etapa em que cada status está.
const ETAPA_ATUAL: Record<StatusPedido, number> = {
    'Em análise': 1,
    'Recusado': 1,
    'Aprovado': 2,
    'Faturado': 3,
};

const ROTULOS: Record<EstadoEtapa, string> = {
    feita:  'Concluída',
    atual: 'Em andamento',
    futura: 'Aguardando',
    recusada: 'Recusada',
};

export const CLASSES_BOLINHA: Record<EstadoEtapa, string> = {
    feita: 'bg-[#26835A] text-white',
    atual: 'bg-[#F3A928] text-white',
    recusada: 'bg-rose-600 text-white',
    futura: 'border border-[#CBD5E1] bg-[#EDF3F5] text-[#94A3B8] dark:border-noite-borda dark:bg-noite-sutil',
};

export const RESUMO_STATUS: Record<StatusPedido, { titulo: string; descricao: string }> = {
    'Em análise': { titulo: 'Em análise comercial', descricao: 'Seu pedido foi recebido e está sendo validado.' },
    'Aprovado': { titulo: 'Pedido aprovado', descricao: 'O pedido segue para a produção.' },
    'Faturado': { titulo: 'Pedido faturado', descricao: 'Aguardando a saída para a entrega.' },
    'Recusado': { titulo: 'Pedido recusado', descricao: 'Veja o motivo no acompanhamento.' },
};

export function montarEtapas(pedido: PedidoDetalhado): EtapaPedido[] {
    const atual = ETAPA_ATUAL[pedido.status];
    const recusado = pedido.status === 'Recusado';
    // Pedido recusado não segue adiante: a linha do tempo para na análise.
    const etapas = recusado ? ETAPAS.slice(0, atual + 1) : ETAPAS;

    return etapas.map((etapa, posicao) => {
        const estado = estadoDaEtapa(posicao, atual, recusado);
        return {
            titulo: etapa.titulo,
            descricao: estado === 'recusada' ? (pedido.motivoRecusa ?? etapa.descricao) : etapa.descricao,
            estado,
            rotulo: posicao === 0 ? pedido.date : ROTULOS[estado],
        };
    });
}

function estadoDaEtapa(posicao: number, atual: number, recusado: boolean): EstadoEtapa {
    if (posicao < atual) return 'feita';
    if (posicao > atual) return 'futura';
    return recusado ? 'recusada' : 'atual';
}
