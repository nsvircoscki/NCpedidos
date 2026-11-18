import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AmostraTintaComponent } from '../../components/amostra-tinta/amostra-tinta.component';
import { StatusPedido } from '../../models/pedido.model';
import { PedidosStore } from '../../services/pedidos-store';

type FiltroAprovacao = 'Todos' | Exclude<StatusPedido, 'Faturado'>;

@Component({
  selector: 'app-aprovacao-pedidos',
  imports: [EsqueletoListaComponent, ErroCarregamentoComponent, RouterLink, CurrencyPipe, AmostraTintaComponent],
  templateUrl: './aprovacao-pedidos.component.html',
})
export class AprovacaoPedidosComponent {
  private readonly pedidosStore = inject(PedidosStore);
  private readonly pedidos = this.pedidosStore.pedidos;
  readonly carregando = this.pedidosStore.carregando;
  readonly erro = this.pedidosStore.erro;

  recarregar(): void {
    this.pedidosStore.recarregar();
  }

  readonly filtros: FiltroAprovacao[] = ['Todos', 'Em análise', 'Aprovado', 'Recusado'];
  readonly filtro = signal<FiltroAprovacao>('Em análise');

  // Faturado já passou da aprovação, então não aparece nesta tela.
  private readonly pedidosDaFila = computed(() => this.pedidos().filter(pedido => pedido.status !== 'Faturado'));

  readonly listaFiltrada = computed(() => {
    const filtro = this.filtro();
    const lista = this.pedidosDaFila();
    return filtro === 'Todos' ? lista : lista.filter(pedido => pedido.status === filtro);
  });

  readonly aguardando = computed(() => this.contarPorStatus('Em análise'));
  readonly aprovados = computed(() => this.contarPorStatus('Aprovado'));
  readonly recusados = computed(() => this.contarPorStatus('Recusado'));

  private contarPorStatus(status: StatusPedido): number {
    return this.pedidosDaFila().filter(pedido => pedido.status === status).length;
  }
}
