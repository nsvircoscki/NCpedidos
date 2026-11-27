import { httpResource } from '@angular/common/http';
import { Injectable, Signal, computed } from '@angular/core';
import { ClienteDoRepresentante, ProdutoDaTabela } from '../models/pedido-rapido.model';
import { carregarDados } from './carregar-dados';

/** Clientes do representante logado (a API filtra pelo token), cada um com a sua tabela de preço. */
// Fica nos providers da tela, e não na raiz: cada login cria um store novo e não sobra a lista de outro representante.
@Injectable()
export class ClientesRepresentanteStore {
  private readonly recurso = carregarDados<ClienteDoRepresentante[]>('/clientes', []);
  readonly clientes = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  /** Produtos da tabela do cliente. Recarrega sozinho quando o cliente muda; sem cliente, não busca nada. */
  produtosDoCliente(clienteId: Signal<number | null>) {
    return httpResource<ProdutoDaTabela[]>(() => {
      const id = clienteId();
      return id === null ? undefined : `/clientes/${id}/produtos`;
    }, { defaultValue: [] });
  }
}
