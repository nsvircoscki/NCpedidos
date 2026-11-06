import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../mobile-header/mobile-header.component';


@Component({
    selector: 'app-pedido-acompanhamento',
    standalone: true,
    imports: [CommonModule, MobileHeaderComponent],
    templateUrl: './pedido-acompanhamento.component.html',
})
export class PedidoAcompanhamentoComponent {
  abaAtiva: 'resumo' | 'acompanhamento' = 'acompanhamento';

  @Output() voltar = new EventEmitter<void>();

  selecionarAba(aba: 'resumo' | 'acompanhamento'): void {
    this.abaAtiva = aba;
  }
}