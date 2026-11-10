import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileHeaderComponent } from '../mobile-header/mobile-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';


@Component({
    selector: 'app-pedido-acompanhamento',
    standalone: true,
    imports: [CommonModule, MobileHeaderComponent, SidebarComponent, TopHeaderComponent, MobileNavigationComponent],
    templateUrl: './pedido-acompanhamento.component.html',
})
export class PedidoAcompanhamentoComponent {
  private readonly router = inject(Router);

  voltarParaPedidos(): void {
    void this.router.navigateByUrl('/pedidos');
  }
}
