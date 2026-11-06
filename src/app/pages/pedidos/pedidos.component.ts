import { Component, computed, inject, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { SidebarService } from '../../services/sidebar';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { PedidoAcompanhamentoComponent } from '../../components/pedido-enviado/pedido-acompanhamento.component';


export interface Order {
    id: number;
    client: string;
    initials: string;
    avatar: 'blue' | 'orange';
    date: string;
    volumes: number;
    total: number;
    status: string;
}

@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        SidebarComponent,
        TopHeaderComponent,
        MobileHeaderComponent,
        MobileNavigationComponent,
        NgmMotionDirective,
        PedidoAcompanhamentoComponent,
    ],
    templateUrl: './pedidos.component.html',
})
export class PedidosComponent implements AfterViewInit {
    private sidebarService = inject(SidebarService);
    sidebarMinimizada = false;

    readonly sent = signal(false);
    readonly pedidoSelecionado = signal<Order | null>(null);
    search = '';
    statusFilter = 'Todos';

    private readonly orders = signal<Order[]>([
        { id: 1047, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '16 set.', volumes: 8,  total: 3240.00, status: 'Faturado'  },
        { id: 1046, client: 'Distribuidora Norte',    initials: 'DN', avatar: 'orange', date: '15 set.', volumes: 12, total: 5870.50, status: 'Aprovado'  },
        { id: 1045, client: 'Materiais Construção RC', initials: 'MC', avatar: 'blue',  date: '14 set.', volumes: 5,  total: 1920.00, status: 'Em análise' },
        { id: 1044, client: 'Ferreira & Filhos Ltda', initials: 'FF', avatar: 'orange', date: '13 set.', volumes: 20, total: 9150.00, status: 'Faturado'  },
        { id: 1043, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '12 set.', volumes: 3,  total: 870.00,  status: 'Aprovado'  },
    ]);

    readonly filteredOrders = computed(() => {
        const termo = this.search.toLowerCase().trim();
        return this.orders().filter((order) => {
            const matchSearch =
                !termo ||
                order.client.toLowerCase().includes(termo) ||
                String(order.id).includes(termo);
            const matchStatus =
                this.statusFilter === 'Todos' || order.status === this.statusFilter;
            return matchSearch && matchStatus;
        });
    });

    @ViewChild('filtersContainer') filtersContainer?: ElementRef<HTMLDivElement>;
    @ViewChild('filtersTrack') filtersTrack?: ElementRef<HTMLDivElement>;

    readonly dragConstraints = signal<{ top: number; bottom: number; left: number; right: number }>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }

    ngAfterViewInit(): void {
        this.atualizarLimitesArrasto();
    }

    @HostListener('window:resize')
    onResize(): void {
        this.atualizarLimitesArrasto();
    }

    atualizarLimitesArrasto(): void {
        if (!this.filtersContainer || !this.filtersTrack) return;
        const containerWidth = this.filtersContainer.nativeElement.offsetWidth;
        const trackWidth = this.filtersTrack.nativeElement.scrollWidth;
        const maxScroll = Math.max(0, trackWidth - containerWidth);

        // left negativo indica o limite máximo que a barra pode ser arrastada para a esquerda
        this.dragConstraints.set({ top: 0, bottom: 0, left: -maxScroll, right: 0 });
    }

    abrirAcompanhamento(order: Order): void {
        this.pedidoSelecionado.set(order);
    }

    fecharAcompanhamento(): void {
        this.pedidoSelecionado.set(null);
    }

    currency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }
}


