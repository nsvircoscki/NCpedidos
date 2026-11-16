import { Service, computed } from '@angular/core';
import { PRODUTOS_EXEMPLO } from '../data/produtos';
import { Produto } from '../models/produto.model';
import { carregarExemplo } from './carregar-exemplo';

@Service()
export class ProdutoService {
  private readonly recurso = carregarExemplo(PRODUTOS_EXEMPLO);
  readonly produtos = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;

  listar(): Produto[] {
    return this.produtos();
  }

  buscarPorId(id: number): Produto | undefined {
    return this.produtos().find(produto => produto.id === id);
  }

  adicionar(dados: Omit<Produto, 'id'>): Produto {
    const novoProduto: Produto = { ...dados, id: Date.now() };
    this.recurso.set([novoProduto, ...this.produtos()]);
    return novoProduto;
  }

  atualizar(id: number, dados: Omit<Produto, 'id'>): Produto | undefined {
    if (!this.buscarPorId(id)) return undefined;

    const produtoAtualizado: Produto = { ...dados, id };
    this.recurso.set(this.produtos().map(produto => (produto.id === id ? produtoAtualizado : produto)));
    return produtoAtualizado;
  }
}
