import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido';
import { Observable, map } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { ProximasEntregas } from '../../components/proximas-entregas/proximas-entregas.component';
import { ControleEntregas } from '../../components/controle-entregas/controle-entregas.component';

@Component({
    selector: 'app-dashboard',
    standalone:true,
    imports: [CommonModule, SidebarComponent, TopHeaderComponent, ProximasEntregas, ControleEntregas],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    private pedidoService = inject(PedidoService);

    pedidosRecentes$!: Observable<Pedido[]>;
    totalPedidos$!: Observable<number>;
    novosPedidos$!: Observable<number>;
    emProcessamento$!: Observable<number>;
    completos$!: Observable<number>;
    valorTotalPeriodo$!: Observable<number>;
    dataAtual = new Date();

    ngOnInit(): void {
        this.pedidosRecentes$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.slice(0,5))
        );
        this.totalPedidos$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.length)
        );
        this.novosPedidos$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.filter(pedido => pedido.status === 'RASCUNHO').length)
        );
        this.emProcessamento$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.filter(pedido => pedido.status === 'PENDENTE').length)
        );
        this.completos$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.filter(pedido => pedido.status === 'APROVADO').length)
        );
        this.valorTotalPeriodo$ = this.pedidoService.pedidos$.pipe(
            map(pedidos => pedidos.reduce((acc, curr) => acc + curr.valorTotal, 0))
        );
    }
}