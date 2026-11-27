import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lerClientesErp, lerProdutosErp, lerTabelasErp, usuariosDosRepresentantes } from './planilha.ts';

describe('lerClientesErp', () => {
    const cabecalho = [
        'Cód. cliente', 'Nome', 'CNPJ/CPF', 'Cidade', 'UF', 'Bloqueado', 'Cód. repres. (cadastro)', 'Representante (cadastro)',
        'Cód. tabela (cadastro)',
    ];
    const tabelas = new Set(['PRI-155', 'AST-41', 'PRI-500', 'AST-500']);

    it('liga o cliente ao código do representante na base dele, sem o prefixo da comissão no nome', () => {
        const { clientes } = lerClientesErp([
            cabecalho,
            ['PRI-1', 'MOVEIS A', '123', 'Rio Negrinho', 'SC', 'F', '57', 'NARCISO JUNIOR', 'PRI-155'],
            ['AST-2', 'MOVEIS B', '456', 'Mafra', 'SC', null, 59, '5 - RAFAEL  BENEDET', 'AST-41'],
        ], tabelas);

        assert.deepEqual(clientes.map(cliente => [cliente.codigo, cliente.tabela, cliente.representante]), [
            ['PRI-1', 'PRI-155', { codigo: 'PRI-57', nome: 'NARCISO JUNIOR' }],
            ['AST-2', 'AST-41', { codigo: 'AST-59', nome: 'RAFAEL BENEDET' }],
        ]);
        assert.equal('documento' in clientes[0], false, 'o CNPJ/CPF não é importado');
    });

    it('sem tabela usa a RECEPCAO da base; sem RECEPCAO na base, a da Principal', () => {
        const { clientes, naRecepcao } = lerClientesErp([
            cabecalho,
            ['AST-4', 'SEM TABELA', '', '', '', null, '57', 'NARCISO JUNIOR', null],
            ['PRI-5', 'TABELA SEM PRODUTOS', '', '', '', null, '57', 'NARCISO JUNIOR', 'PRI-999'],
            ['MGA-6', 'MINAS', '', '', '', null, '57', 'NARCISO JUNIOR', null],
        ], tabelas);

        assert.deepEqual(clientes.map(cliente => cliente.tabela), ['AST-500', 'PRI-500', 'PRI-500']);
        assert.equal(naRecepcao.length, 3);
    });

    it('deixa de fora o cliente bloqueado e o que não tem representante de verdade', () => {
        const { clientes, rejeitados } = lerClientesErp([
            cabecalho,
            ['PRI-7', 'BLOQUEADO', '', '', '', 'T', '57', 'NARCISO JUNIOR', 'PRI-155'],
            ['PRI-8', 'DO INATIVO', '', '', '', null, '18', 'INATIVO', 'PRI-155'],
            ['PRI-9', 'SEM NINGUEM', '', '', '', null, null, null, 'PRI-155'],
        ], tabelas);

        assert.deepEqual(clientes, []);
        assert.deepEqual(rejeitados, [
            'PRI-7 BLOQUEADO: bloqueado no ERP',
            'PRI-8 DO INATIVO: sem representante (INATIVO)',
            'PRI-9 SEM NINGUEM: sem representante (vazio)',
        ]);
    });

    it('recusa planilha sem a coluna esperada', () => {
        assert.throws(() => lerClientesErp([['Cód. cliente', 'Nome']], tabelas), /Cidade/);
    });
});

describe('usuariosDosRepresentantes', () => {
    it('usa o primeiro nome, sem acento; quem divide o primeiro nome usa o nome inteiro', () => {
        const usuarios = usuariosDosRepresentantes(['RAFAEL BENEDET', 'ANDRÉ NASCIMENTO', 'WILSON SP', 'WILSON MG', 'WILSON']);

        assert.deepEqual([...usuarios.values()], ['rafael', 'andre', 'wilson.sp', 'wilson.mg', 'wilson']);
    });
});

describe('lerTabelasErp', () => {
    it('lê todas as tabelas, inclusive a sem nome', () => {
        const tabelas = lerTabelasErp([
            ['Cód. tabela', 'Tabela', 'Base no ERP', 'Cód. tabela no ERP'],
            ['PRI-3', 'Wi Tintas', 'Principal', '3'],
            ['PRI-546', null, 'Principal', '546'],
            [],
        ]);

        assert.deepEqual(tabelas, [
            { codigo: 'PRI-3', nome: 'Wi Tintas', base: 'Principal', codigoErp: '3' },
            { codigo: 'PRI-546', nome: '', base: 'Principal', codigoErp: '546' },
        ]);
    });
});

describe('lerProdutosErp', () => {
    const cabecalho = ['Cód. tabela', 'Cód. produto', 'Produto', 'Unidade'];

    it('usa o nome da Principal mesmo quando outra base aparece antes', () => {
        const { produtos, itens } = lerProdutosErp([
            cabecalho,
            ['AST-41', '1002.20', 'DILUENTE PU', 'LT'],
            ['PRI-3', '1002.20', 'DILUENTE PU ALTA PERFORMANCE', 'LT'],
            ['PRI-4', '1002.20', 'OUTRO NOME', 'LT'],
        ]);

        assert.equal(produtos.get('1002.20')?.descricao, 'DILUENTE PU ALTA PERFORMANCE');
        assert.deepEqual(itens.get('AST-41'), ['1002.20']);
    });

    it('sem Principal, fica o primeiro nome', () => {
        const { produtos } = lerProdutosErp([
            cabecalho,
            ['AST-41', '1010.20', 'RETARDADOR', 'LT'],
            ['MG-28', '1010.20', 'SOLVENTE', 'LT'],
        ]);

        assert.equal(produtos.get('1010.20')?.descricao, 'RETARDADOR');
    });

    it('rejeita produto sem cadastro e não o coloca na tabela', () => {
        const { itens, rejeitadas } = lerProdutosErp([
            cabecalho,
            ['PRI-3', '1000.18', 'DILUENTE PARA PU', 'LT'],
            ['PRI-3', '10946.1', null, null],
        ]);

        assert.deepEqual(itens.get('PRI-3'), ['1000.18']);
        assert.deepEqual(rejeitadas, [{ tabela: 'PRI-3', descricao: 'linha 3: produto 10946.1 sem cadastro' }]);
    });
});
