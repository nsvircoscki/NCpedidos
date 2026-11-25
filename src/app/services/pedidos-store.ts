import { Service, computed, inject } from '@angular/core';
import { PEDIDOS_EXEMPLO } from '../data/pedidos';
import { PedidoDetalhado } from '../models/pedido.model';
import { carregarDados } from './carregar-dados';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { formatarData } from '../utils/datas';

/** Lista de pedidos compartilhada entre Pedidos, dashboard, Novo pedido e Aprovação. */
@Service()
export class PedidosStore {
  private readonly http = inject(HttpClient);
  private readonly recurso = carregarDados('/pedidos', PEDIDOS_EXEMPLO);
  readonly pedidos = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  buscar(id: number): PedidoDetalhado | undefined {
    return this.pedidos().find(pedido => pedido.id === id);
  }

  async adicionar(pedido: Omit<PedidoDetalhado, 'id'>): Promise<PedidoDetalhado> {
    const novo = environment.usarDadosExemplo
      ? { ...pedido, id: Math.max(0, ...this.pedidos().map(p => p.id)) + 1 }
      : await firstValueFrom(this.http.post<PedidoDetalhado>('/pedidos', pedido));

    this.recurso.set([novo, ...this.pedidos()]);
    return novo;
  }

  async aprovar(id: number, previsaoEntrega: string): Promise<void> {
    if (!environment.usarDadosExemplo) {
      await firstValueFrom(this.http.post(`/pedidos/${id}/aprovar`, { previsaoEntrega }));
    }
    this.alterar(id, { status: 'Aprovado', motivoRecusa: undefined, previsaoEntrega: formatarData(previsaoEntrega) });
  }

  async recusar(id: number, motivo: string): Promise<void> {
    if (!environment.usarDadosExemplo) {
      await firstValueFrom(this.http.post(`/pedidos/${id}/recusar`, { motivo }));
    }
    this.alterar(id, { status: 'Recusado', motivoRecusa: motivo });
  }

  private alterar(id: number, mudancas: Partial<PedidoDetalhado>): void {
    this.recurso.set(this.pedidos().map(pedido => (pedido.id === id ? { ...pedido, ...mudancas } : pedido)));
  }
}
