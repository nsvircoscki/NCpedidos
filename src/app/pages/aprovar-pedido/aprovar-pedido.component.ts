import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';

@Component({
  selector: 'app-aprovar-pedido',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './aprovar-pedido.component.html',
})
export class AprovarPedidoComponent {
  private readonly store = inject(PedidosStore);
  private readonly pedidoPdf = inject(PedidoPdfService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  // computed lê a lista do store: depois de aprovar ou recusar, a tela já mostra o novo status.
  readonly pedido = computed(() => this.store.pedidos().find(pedido => pedido.id === this.id));
  readonly subtotal = computed(() => {
    const pedido = this.pedido();
    return pedido ? pedido.total + pedido.desconto : 0;
  });

  readonly motivo = signal('');
  readonly faltaMotivo = signal(false);

  aprovar(): void {
    this.store.aprovar(this.id);
    this.faltaMotivo.set(false);
  }

  recusar(): void {
    const motivo = this.motivo().trim();
    if (!motivo) {
      this.faltaMotivo.set(true);
      return;
    }
    this.store.recusar(this.id, motivo);
    this.faltaMotivo.set(false);
  }

  enviarPdf(): void {
    const pedido = this.pedido();
    if (pedido) {
      this.pedidoPdf.enviarAoCliente(pedido);
    }
  }

  baixarPdf(): void {
    const pedido = this.pedido();
    if (pedido) {
      this.pedidoPdf.baixar(pedido);
    }
  }
}
