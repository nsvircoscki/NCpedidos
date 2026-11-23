import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';

@Component({
  selector: 'app-aprovar-pedido',
  imports: [EsqueletoListaComponent, RouterLink, CurrencyPipe],
  templateUrl: './aprovar-pedido.component.html',
})
export class AprovarPedidoComponent {
  private readonly store = inject(PedidosStore);
  private readonly pedidoPdf = inject(PedidoPdfService);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly carregando = this.store.carregando;

  // computed lê a lista do store: depois de aprovar ou recusar, a tela já mostra o novo status.
  readonly pedido = computed(() => this.store.pedidos().find(pedido => pedido.id === this.id));
  readonly subtotal = computed(() => {
    const pedido = this.pedido();
    return pedido ? pedido.total + pedido.desconto : 0;
  });

  readonly motivo = signal('');
  readonly faltaMotivo = signal(false);
  readonly erroAoSalvar = signal('');

  async aprovar(): Promise<void> {
    this.faltaMotivo.set(false);
    await this.tentar(() => this.store.aprovar(this.id));
  }

  async recusar(): Promise<void> {
    const motivo = this.motivo().trim();
    this.faltaMotivo.set(!motivo);
    if (!motivo) return;
    await this.tentar(() => this.store.recusar(this.id, motivo));
  }

  private async tentar(acao: () => Promise<void>): Promise<void> {
    try {
      await acao();
      this.erroAoSalvar.set('');
    } catch {
      this.erroAoSalvar.set('Ocorreu um erro ao salvar. Tente novamente.');
    }
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
