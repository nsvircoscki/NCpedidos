import { Service, computed } from '@angular/core';
import { PEDIDOS_EXEMPLO } from '../data/pedidos';
import { PedidoDetalhado } from '../models/pedido.model';
import { carregarExemplo } from './carregar-exemplo';

/** Lista de pedidos compartilhada entre Pedidos, dashboard, Novo pedido e Aprovação. */
@Service()
export class PedidosStore {
  private readonly recurso = carregarExemplo(PEDIDOS_EXEMPLO);
  readonly pedidos = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;

  buscar(id: number): PedidoDetalhado | undefined {
    return this.pedidos().find(pedido => pedido.id === id);
  }

  adicionar(pedido: Omit<PedidoDetalhado, 'id'>): PedidoDetalhado {
    const id = Math.max(0, ...this.pedidos().map(p => p.id)) + 1;
    const novo = { ...pedido, id };
    this.recurso.set([novo, ...this.pedidos()]);
    return novo;
  }

  aprovar(id: number): void {
    this.alterar(id, { status: 'Aprovado', motivoRecusa: undefined });
  }

  recusar(id: number, motivo: string): void {
    this.alterar(id, { status: 'Recusado', motivoRecusa: motivo });
  }

  private alterar(id: number, mudancas: Partial<PedidoDetalhado>): void {
    this.recurso.set(this.pedidos().map(pedido => (pedido.id === id ? { ...pedido, ...mudancas } : pedido)));
  }
}
