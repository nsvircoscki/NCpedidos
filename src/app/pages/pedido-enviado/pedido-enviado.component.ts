import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';
import { PedidoAcompanhamentoComponent } from './pedido-acompanhamento.component';
import { RESUMO_STATUS } from './etapas-pedido';
import { NgmMotionDirective, type Transition } from '@scripttype/ng-motion';


@Component({
  selector: 'app-pedido-enviado',
  standalone: true,
  imports: [EsqueletoListaComponent, CommonModule, PedidoAcompanhamentoComponent, NgmMotionDirective],
  templateUrl: './pedido-enviado.component.html',
})
export class PedidoEnviadoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Número do pedido vindo da rota (/pedidos/1047). */
  readonly numeroPedido = this.route.snapshot.paramMap.get('id') ?? '';

  /** Spring do indicador deslizante das abas Resumo/Acompanhamento. */
  readonly indicadorTransition: Transition = { type: 'spring', stiffness: 400, damping: 32 };

  private readonly pedidoPdf = inject(PedidoPdfService);
  private readonly pedidosStore = inject(PedidosStore);
  readonly carregando = this.pedidosStore.carregando;
  readonly pedido = computed(() => this.pedidosStore.buscar(Number(this.numeroPedido)));
  readonly resumo = computed(() => {
    const pedido = this.pedido();
    return pedido ? RESUMO_STATUS[pedido.status] : null;
  });

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

  selecionarAba(aba: 'resumo' | 'acompanhamento'): void {
    this.abaAtiva = aba;

    if (aba === 'acompanhamento') {
      this.verAcompanhamento.emit();
    }
    
  }

  alternarAba(): void {
    const proximaAba = this.abaAtiva === 'resumo' ? 'acompanhamento' : 'resumo';
    this.selecionarAba(proximaAba);
  }

  voltarParaPedido(): void {
    this.voltar.emit();
    void this.router.navigateByUrl('/pedidos');
  }

  visualizarCliente(): void {
    this.abrirCliente.emit();

  }

  abaAtiva: 'resumo' | 'acompanhamento' =
    this.route.snapshot.queryParamMap.get('aba') === 'acompanhamento' ? 'acompanhamento' : 'resumo';

  @Output() voltar = new EventEmitter<void>();
  @Output() verAcompanhamento = new EventEmitter<void>(); 
  @Output() abrirCliente = new EventEmitter<void>();
}
