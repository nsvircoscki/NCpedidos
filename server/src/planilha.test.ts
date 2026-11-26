import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lerTabelaCliente } from './planilha.ts';

const cabecalho = [
    ['Tabela de Preço: ALGI MOVEIS'],
    ['Código da tabela: 155  |  Emitido em 26/11/2026 14:05'],
    [],
    ['Código', 'Descrição', 'Unidade', 'Preço'],
];

describe('lerTabelaCliente', () => {
    it('lê cliente, código da tabela, data e produtos', () => {
        const tabela = lerTabelaCliente([
            ...cabecalho,
            ['1000.20', 'DILUENTE PARA PU', 'LT', 13.94],
            ['2000.1', 'CATALISADOR ( 900ML )', 'UN', '1.024,52'],
        ]);

        assert.equal(tabela.cliente, 'ALGI MOVEIS');
        assert.equal(tabela.codigoTabela, '155');
        assert.equal(tabela.emitidaEm, '2026-11-26T14:05:00-03:00');
        assert.deepEqual(tabela.itens, [
            { codigo: '1000.20', descricao: 'DILUENTE PARA PU', unidade: 'LT', preco: 13.94 },
            { codigo: '2000.1', descricao: 'CATALISADOR ( 900ML )', unidade: 'UN', preco: 1024.52 },
        ]);
    });

    it('pula linhas vazias ou sem preço', () => {
        const tabela = lerTabelaCliente([...cabecalho, [], ['1000.20', 'DILUENTE', 'LT', ''], [null, 'SEM CÓDIGO', 'LT', 10]]);

        assert.deepEqual(tabela.itens, []);
    });

    it('recusa planilha fora do formato', () => {
        assert.throws(() => lerTabelaCliente([['Relatório qualquer'], ['outra coisa']]));
    });
});
