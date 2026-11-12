import { Service, signal } from '@angular/core';
import { PEDIDOS_EXEMPLO } from '../data/pedidos';
import { PedidoDetalhado } from '../models/pedido.model';

/** Lista de pedidos compartilhada entre Pedidos, dashboard, Novo pedido e Aprovação. */
@Service()
export class PedidosStore {
  private readonly lista = signal<PedidoDetalhado[]>(PEDIDOS_EXEMPLO);
  readonly pedidos = this.lista.asReadonly();

  buscar(id: number): PedidoDetalhado | undefined {
    return this.lista().find(pedido => pedido.id === id);
  }

  adicionar(pedido: Omit<PedidoDetalhado, 'id'>): PedidoDetalhado {
    const id = Math.max(...this.lista().map(p => p.id)) + 1;
    const novo = { ...pedido, id };
    this.lista.update(lista => [novo, ...lista]);
    return novo;
  }

  aprovar(id: number): void {
    this.alterar(id, { status: 'Aprovado', motivoRecusa: undefined });
  }

  recusar(id: number, motivo: string): void {
    this.alterar(id, { status: 'Recusado', motivoRecusa: motivo });
  }

  private alterar(id: number, mudancas: Partial<PedidoDetalhado>): void {
    this.lista.update(lista => lista.map(pedido => (pedido.id === id ? { ...pedido, ...mudancas } : pedido)));
  }
}
