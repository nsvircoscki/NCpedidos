import { ItemTabelaPreco } from '../models/tabela-preco.model';

export const TABELAS_PRECO_EXEMPLO: Record<number, ItemTabelaPreco[]> = {
  1: [
    { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 269.90 },
    { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 109.90 },
    { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 69.50 }
  ],
  2: [
    { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 289.90 },
    { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 119.90 },
    { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 74.50 }
  ],
  3: [
    { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 254.90 },
    { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 99.90 },
    { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 64.50 }
  ]
};
