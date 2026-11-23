import { Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { CLASSES_BOLINHA, RESUMO_STATUS, montarEtapas } from './etapas-pedido';

@Component({
  selector: 'app-pedido-acompanhamento',
  imports: [NgTemplateOutlet],
  templateUrl: './pedido-acompanhamento.component.html',
})
export class PedidoAcompanhamentoComponent {
  private readonly router = inject(Router);
  private readonly pedidosStore = inject(PedidosStore);

  /** true dentro do Pedido enviado: mostra só o conteúdo, sem o cabeçalho próprio. */
  readonly embutido = input(false);
  /** Embutido, recebe o número do Pedido enviado; pela rota /pedidos/:id/acompanhamento, lê da URL. */
  readonly numeroPedido = input(inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '');

  readonly pedido = computed(() => this.pedidosStore.buscar(Number(this.numeroPedido())));
  readonly etapas = computed(() => {
    const pedido = this.pedido();
    return pedido ? montarEtapas(pedido) : [];
  });
  readonly resumo = computed(() => {
    const pedido = this.pedido();
    return pedido ? RESUMO_STATUS[pedido.status] : null;
  });
  readonly classesBolinha = CLASSES_BOLINHA;

  voltarParaPedidos(): void {
    void this.router.navigateByUrl('/pedidos');
  }
}
