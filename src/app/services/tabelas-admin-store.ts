import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProdutoDaTabela, TabelaDoErp } from '../models/pedido-rapido.model';

/** Tabelas de preço do ERP para o admin: a lista, os itens de cada uma e a busca de produtos. */
@Injectable()
export class TabelasAdminStore {
  private readonly http = inject(HttpClient);
  private readonly recurso = httpResource<TabelaDoErp[]>(() => '/tabelas', { defaultValue: [] });
  readonly tabelas = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  /** Recarrega sozinho quando a tabela escolhida muda; sem tabela, não busca nada. */
  itensDaTabela(codigo: Signal<string | null>) {
    return httpResource<ProdutoDaTabela[]>(() => {
      const atual = codigo();
      return atual === null ? undefined : `/tabelas/${atual}/itens`;
    }, { defaultValue: [] });
  }

  /** Produtos para adicionar numa tabela: busca a partir de 2 letras. */
  buscarProdutos(termo: Signal<string>) {
    return httpResource<ProdutoDaTabela[]>(() => {
      const busca = termo().trim();
      return busca.length < 2 ? undefined : { url: '/produtos', params: { busca } };
    }, { defaultValue: [] });
  }

  async salvarItens(codigo: string, produtos: string[]): Promise<void> {
    await firstValueFrom(this.http.put<void>(`/tabelas/${codigo}/itens`, { produtos }));
    this.recurso.update(lista =>
      (lista ?? []).map(tabela => (tabela.codigo === codigo ? { ...tabela, itens: produtos.length, editada: true } : tabela)),
    );
  }
}
