import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';

@Component({
  selector: 'app-pedido-enviado',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopHeaderComponent, MobileNavigationComponent],
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
