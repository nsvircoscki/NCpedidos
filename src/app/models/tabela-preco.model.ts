export interface ItemTabelaPreco {
  id: number;
  produto: string;
  codigoSKU: string;
  categoria: string;
  embalagem: string;
  estoque: number;
  precoBase: number;
  status: 'ATIVO' | 'INATIVO';
  cor: string;
  preco: number;
}
