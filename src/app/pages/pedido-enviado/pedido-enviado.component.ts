import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';
import { PedidoAcompanhamentoComponent } from './pedido-acompanhamento.component';
import { NgmMotionDirective, type Transition } from '@scripttype/ng-motion';


@Component({
  selector: 'app-pedido-enviado',
  standalone: true,
  imports: [CommonModule, PedidoAcompanhamentoComponent, NgmMotionDirective],
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
  readonly pedido = inject(PedidosStore).buscar(Number(this.numeroPedido));

  enviarPdf(): void {
    if (this.pedido) {
      this.pedidoPdf.enviarAoCliente(this.pedido);
    }
  }

  baixarPdf(): void {
    if (this.pedido) {
      this.pedidoPdf.baixar(this.pedido);
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
