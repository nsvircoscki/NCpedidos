import { Produto } from '../models/produto.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ProdutoService {
    private produtos: Produto[] = [
    {
      id: 1,
      nome: 'Tinta Acrílica Premium',
      codigoSKU: 'ACR-PRO-18-BN',
      descricao: 'Tinta acrílica premium para paredes.',
      categoria: 'Paredes',
      embalagem: '18 L',
      estoque: 124,
      preco: 289.9,
      precosPorCliente: {
        'casa-almeida': 279.8,
        'joao-silva': 284.9,
        'constrular': 289.9,
      },
      margem: 38.4,
      status: 'ATIVO',
      cor: 'Branco Neve',
      rendimento: 'Até 100 m²',
      acabamento: 'Fosco',
      linha: 'Profissional',
      atualizadoEm: 'Hoje, 09:42',
      estoqueReservado: 28,
      giro30Dias: 96,
      estoquePorDeposito: [
        { nome: 'Centro de Distribuição', localizacao: 'São Bento do Sul - SC', quantidade: 104 },
      ],
      variacoes: [
        { nome: 'Branco Neve', codigoSKU: 'ACR-PRO-18-BN', embalagem: '18 L', estoque: 48, preco: 289.9, corHex: '#f2efe6' },
        { nome: 'Palha', codigoSKU: 'ACR-PRO-18-PL', embalagem: '18 L', estoque: 32, preco: 294.9, corHex: '#e7dec8' },
        { nome: 'Gelo', codigoSKU: 'ACR-PRO-18-GL', embalagem: '18 L', estoque: 28, preco: 294.9, corHex: '#d8dcda' },
        { nome: 'Azul Névoa', codigoSKU: 'ACR-PRO-18-AN', embalagem: '3,6 L', estoque: 16, preco: 94.9, corHex: '#d7e6eb' },
      ],
    },
    {
      id: 2,
      nome: 'Tinta Acrílica Standard',
      codigoSKU: 'ACR-STD-18-GE',
      descricao: 'Tinta acrílica standard para paredes.',
      categoria: 'Paredes',
      embalagem: '18 L',
      estoque: 86,
      preco: 219.9,
      margem: 35.1,
      status: 'ATIVO',
      cor: 'Gelo',
    },
    {
      id: 3,
      nome: 'Massa Corrida',
      codigoSKU: 'MAS-001-25',
      descricao: 'Massa corrida para acabamento.',
      categoria: 'Preparação',
      embalagem: '25 kg',
      estoque: 42,
      preco: 89.9,
      margem: 29.5,
      status: 'INATIVO',
      cor: 'Branco',
    },
  ];

  listar(): Produto[] {
    return this.produtos;
  }

  buscarPorId(id: number): Produto | undefined {
    return this.produtos.find((produto) => produto.id === id);
  }

  adicionar(dados: Omit<Produto, 'id'>): Produto {
    const novoProduto: Produto = {
      ...dados,
      id: Date.now(),
    };

    this.produtos = [novoProduto, ...this.produtos];

    return novoProduto;
  }

  atualizar(id: number, dados: Omit<Produto, 'id'>): Produto | undefined {
    const produtoExiste = this.produtos.some((produto) => produto.id === id);

    if (!produtoExiste) {
        return undefined;
    }

    const produtoAtualizado: Produto = {
        ...dados,
        id,
    };

    this.produtos = this.produtos.map((produto) =>
        produto.id === id ? produtoAtualizado : produto
    );

    return produtoAtualizado;
  }
}
