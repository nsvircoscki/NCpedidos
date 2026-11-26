import { PEDIDOS_EXEMPLO } from '../../data/pedidos';
import { montarEtapas } from './etapas-pedido';

const pedido = PEDIDOS_EXEMPLO[0];

describe('montarEtapas', () => {
    it('em análise: só a primeira etapa está feita', () => {
        const etapas = montarEtapas({ ...pedido, status: 'Em análise' });

        expect(etapas.map((etapa) => etapa.estado)).toEqual(['feita', 'atual', 'futura', 'futura', 'futura']);
    });

    it('recusado: para na análise e mostra o motivo', () => {
        const etapas = montarEtapas({ ...pedido, status: 'Recusado', motivoRecusa: 'Sem limite de crédito.' });

        expect(etapas.length).toBe(2);
        expect(etapas[1].estado).toBe('recusada');
        expect(etapas[1].descricao).toBe('Sem limite de crédito.');
    });

    it('faturado: está na etapa de entrega', () => {
        const etapas = montarEtapas({ ...pedido, status: 'Faturado' });

        expect(etapas.map((etapa) => etapa.estado)).toEqual(['feita', 'feita', 'feita', 'atual', 'futura']);
        expect(etapas[3].titulo).toBe('Saiu para entrega');
    });
});
