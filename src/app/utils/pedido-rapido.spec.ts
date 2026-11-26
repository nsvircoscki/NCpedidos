import { ProdutoDaTabela } from '../models/pedido-rapido.model';
import { faltamDescricoes, filtrarProdutos, itensDoPedido, nomeDoArquivo, novaChave, numeroDoPedido, totalDeUnidades } from './pedido-rapido';

const DILUENTE: ProdutoDaTabela = { codigo: '1000.20', descricao: 'DILUENTE PARA PU', unidade: 'LT' };
const TINGIDOR: ProdutoDaTabela = { codigo: '11383.5', descricao: 'TINGIDOR MEL', unidade: 'LT' };
const CATALISADOR: ProdutoDaTabela = { codigo: '2000.1', descricao: 'CATALISADOR ( 900ML )', unidade: 'UN' };

describe('pedido rápido', () => {
    it('número do pedido vem da data e hora', () => {
        expect(numeroDoPedido(new Date(2026, 10, 6, 9, 5))).toBe('20261106-0905');
    });

    it('nome do arquivo sem acento, espaço nem símbolo', () => {
        expect(nomeDoArquivo('Pinturas São João & Cia.', '20261106-0905')).toBe('pedido-pinturas-sao-joao-cia-20261106-0905.pdf');
        expect(nomeDoArquivo('  ', '20261106-0905')).toBe('pedido-cliente-20261106-0905.pdf');
    });

    it('busca por descrição ou código sem diferença de acento e maiúscula', () => {
        expect(filtrarProdutos([DILUENTE, TINGIDOR], 'tingidor')).toEqual([TINGIDOR]);
        expect(filtrarProdutos([DILUENTE, TINGIDOR], '1000.2')).toEqual([DILUENTE]);
        expect(filtrarProdutos([DILUENTE, TINGIDOR], '  ')).toEqual([DILUENTE, TINGIDOR]);
    });

    it('itens do pedido seguem a ordem da tabela e ignoram quantidade zero', () => {
        const quantidades = { '2000.1': 3, '1000.20': 2, '11383.5': 0 };

        expect(itensDoPedido([DILUENTE, TINGIDOR, CATALISADOR], quantidades)).toEqual([
            { ...DILUENTE, quantidade: 2 },
            { ...CATALISADOR, quantidade: 3 },
        ]);
        expect(totalDeUnidades(quantidades)).toBe(5);
    });

    it('vários produtos de desenvolvimento, cada um com a sua descrição', () => {
        const desenvolvimento: ProdutoDaTabela = { codigo: 'DESENV', descricao: 'PRODUTO DESENVOLVIMENTO', unidade: 'UN', pedeDescricao: true };
        const quantidades = { 'DESENV#2': 3, 'DESENV#1': 1, '1000.20': 1 };
        const produtos = [desenvolvimento, DILUENTE];

        expect(novaChave('DESENV', quantidades)).toBe('DESENV#3');
        expect(novaChave('DESENV', {})).toBe('DESENV#1');
        expect(faltamDescricoes(produtos, quantidades, { 'DESENV#1': 'Verniz fosco', 'DESENV#2': '  ' })).toBe(true);
        expect(faltamDescricoes(produtos, quantidades, { 'DESENV#1': 'Verniz fosco', 'DESENV#2': 'Seladora' })).toBe(false);
        expect(itensDoPedido(produtos, quantidades, { 'DESENV#1': ' Verniz fosco ', 'DESENV#2': 'Seladora' })).toEqual([
            { codigo: 'DESENV', descricao: 'PRODUTO DESENVOLVIMENTO: Verniz fosco', unidade: 'UN', quantidade: 1 },
            { codigo: 'DESENV', descricao: 'PRODUTO DESENVOLVIMENTO: Seladora', unidade: 'UN', quantidade: 3 },
            { ...DILUENTE, quantidade: 1 },
        ]);
    });
});
