import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ItemPedido } from '../../models/pedido.model';
import { Pedido } from '../../models/pedido.model';
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

   readonly order = {
    number: '1048',
    sentAt: 'Hoje, às 10:24',
    status: 'Aguardando análise',
    paymentTerm: '28 dias',
    deliveryEstimate: 'Informado pela empresa',
    total: 715.06,
  };

  readonly client = {
    id: 1047,
    initials: 'CA',
    name: 'Casa Almeida Materiais',
    document: '12.345.678/0001-90',
  };

  readonly orderItems: ItemPedido[] = [
    {
      produtoId: 1,
      nome: 'Tinta Acrílica Premium',
      quantidade: 2,
      precoUnitario: 289.9,
    },
    {
      produtoId: 2,
      nome: 'Esmalte Sintético',
      quantidade: 1,
      precoUnitario: 94.5,
    },
    {
      produtoId: 3,
      nome: 'Massa Corrida PVA',
      quantidade: 1,
      precoUnitario: 78.4,
    },
  ];

  get totalItems(): number {
    return this.orderItems.reduce((total, item) => total + item.quantidade, 0);
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

  calcularSubtotal(item: ItemPedido): number {
    return item.quantidade * item.precoUnitario;
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  abaAtiva: 'resumo' | 'acompanhamento' =
    this.route.snapshot.queryParamMap.get('aba') === 'acompanhamento' ? 'acompanhamento' : 'resumo';

  @Output() voltar = new EventEmitter<void>();
  @Output() verAcompanhamento = new EventEmitter<void>(); 
  @Output() abrirCliente = new EventEmitter<void>();
}
