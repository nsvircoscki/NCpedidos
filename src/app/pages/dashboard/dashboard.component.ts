import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido';
import { Observable, map } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { ProximasEntregas } from '../../components/proximas-entregas/proximas-entregas.component';
import { ControleEntregas } from '../../components/controle-entregas/controle-entregas.component';
import { SidebarService } from '../../services/sidebar';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-dashboard',
    standalone:true,
    imports: [CommonModule, RouterModule, SidebarComponent, MobileNavigationComponent, TopHeaderComponent, ProximasEntregas, ControleEntregas, DragDropModule],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    widgets = ['total', 'novos', 'processamento', 'completos'];

    private sidebarService = inject(SidebarService);
    sidebarMinimizada = false;

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }
    
    private pedidoService = inject(PedidoService);

    pedidosRecentes$!: Observable<Pedido[]>;
    totalPedidos$!: Observable<number>;
    novosPedidos$!: Observable<number>;
    emProcessamento$!: Observable<number>;
    completos$!: Observable<number>;
    valorTotalPeriodo$!: Observable<number>;
    dataAtual = new Date();

    reorganizarWidgets(evento: CdkDragDrop<string[]>): void {
        moveItemInArray(this.widgets, evento.previousIndex, evento.currentIndex);
    }


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