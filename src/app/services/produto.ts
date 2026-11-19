import { Service, computed, inject } from '@angular/core';
import { PRODUTOS_EXEMPLO } from '../data/produtos';
import { Produto } from '../models/produto.model';
import { carregarDados } from './carregar-dados';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly recurso = carregarDados('/produtos', PRODUTOS_EXEMPLO);
  readonly produtos = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  listar(): Produto[] {
    return this.produtos();
  }

  buscarPorId(id: number): Produto | undefined {
    return this.produtos().find(produto => produto.id === id);
  }

  async adicionar(dados: Omit<Produto, 'id'>): Promise<Produto> {
    const novoProduto = environment.usarDadosExemplo
      ? { ...dados, id: Date.now() }
      : await firstValueFrom(this.http.post<Produto>('/produtos', dados));

    this.recurso.set([ ...this.produtos(), novoProduto]);
    return novoProduto;
  }

  async atualizar(id: number, dados: Omit<Produto, 'id'>): Promise<Produto> {
    const produtoAtualizado = environment.usarDadosExemplo
      ? { ...dados, id }
      : await firstValueFrom(this.http.put<Produto>(`/produtos/${id}`, dados));

    this.recurso.set(this.produtos().map(produto => produto.id === id ? produtoAtualizado : produto));
    return produtoAtualizado;
  }
}
