import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedido-enviado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido-enviado.component.html',
})
export class PedidoEnviadoComponent {
  abaAtiva: 'resumo' | 'acompanhamento' = 'resumo';

  @Output() voltar = new EventEmitter<void>();
  @Output() verAcompanhamento = new EventEmitter<void>(); 

  selecionarAba(aba: 'resumo' | 'acompanhamento'): void {
    this.abaAtiva = aba;
    
    if (aba === 'acompanhamento') {
      this.verAcompanhamento.emit(); 
    }
  }
}