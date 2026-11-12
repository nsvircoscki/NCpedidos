import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { PedidoAcompanhamentoComponent } from '../pedido-enviado/pedido-acompanhamento.component';
import { ClienteOption } from '../../models/cliente.model';


export interface Order {
    id: number;
    clienteId: number;
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
        NgmMotionDirective,
        PedidoAcompanhamentoComponent,
    ],
    templateUrl: './pedidos.component.html',
})
export class PedidosComponent implements AfterViewInit {
    private route = inject(ActivatedRoute);

    /**
     * Filtro vindo da tela de clientes (/pedidos?clienteId=3).
     * null = sem filtro, mostra os pedidos de todos os clientes.
     */
    readonly clienteIdFiltro: number | null = this.lerClienteIdFiltro();

    private lerClienteIdFiltro(): number | null {
        const valor = this.route.snapshot.queryParamMap.get('clienteId');
        return valor ? Number(valor) : null;
    }

    readonly clientes: ClienteOption[] = [
        { id: 1, nome: 'Casa Almeida Materiais', documento: '12.345.678/0001-90', limite: 10000 },
        { id: 2, nome: 'Distribuidora Norte', documento: '98.765.432/0001-12', limite: 15000 },
        { id: 3, nome: 'Materiais Construção RC', documento: '11.222.333/0001-44', limite: 8000 },
        { id: 4, nome: 'Ferreira & Filhos Ltda', documento: '55.666.777/0001-88', limite: 20000 },
    ];

    clienteSelecionado: ClienteOption = this.clientes[0];
    modalClienteAberto = false;
    buscaCliente = '';

    readonly sent = signal(false);
    readonly pedidoSelecionado = signal<Order | null>(null);
    search = '';
    statusFilter = 'Todos';
    filtrosAbertos = false;
    readonly statusOptions = ['Todos', 'Em análise', 'Aprovado', 'Faturado'];

    get totalFiltrosAtivos(): number {
        return (this.statusFilter !== 'Todos' ? 1 : 0) + (this.search.trim() ? 1 : 0);
    }

    limparFiltros(): void {
        this.search = '';
        this.statusFilter = 'Todos';
    }

    abrirModalCliente(): void {
        this.buscaCliente = '';
        this.modalClienteAberto = true;
    }

    fecharModalCliente(): void {
        this.modalClienteAberto = false;
    }

    selecionarCliente(cliente: ClienteOption): void {
        this.clienteSelecionado = cliente;
        this.fecharModalCliente();
    }

    get clientesFiltrados(): ClienteOption[] {
        const termo = this.buscaCliente.toLowerCase().trim();
        return this.clientes.filter(cliente =>
            !termo ||
            cliente.nome.toLowerCase().includes(termo) ||
            cliente.documento.toLowerCase().includes(termo)
        );
    }


    iniciais(nome: string): string {
        return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
    }

    private readonly orders = signal<Order[]>([
        { id: 1047, clienteId: 1, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '16 set.', volumes: 8,  total: 3240.00, status: 'Faturado'  },
        { id: 1046, clienteId: 2, client: 'Distribuidora Norte',    initials: 'DN', avatar: 'orange', date: '15 set.', volumes: 12, total: 5870.50, status: 'Aprovado'  },
        { id: 1045, clienteId: 3, client: 'Materiais Construção RC', initials: 'MC', avatar: 'blue',  date: '14 set.', volumes: 5,  total: 1920.00, status: 'Em análise' },
        { id: 1044, clienteId: 4, client: 'Ferreira & Filhos Ltda', initials: 'FF', avatar: 'orange', date: '13 set.', volumes: 20, total: 9150.00, status: 'Faturado'  },
        { id: 1043, clienteId: 1, client: 'Casa Almeida Materiais', initials: 'CA', avatar: 'blue',   date: '12 set.', volumes: 3,  total: 870.00,  status: 'Aprovado'  },
    ]);

    // Método (e não computed) porque search/statusFilter não são signals:
    // um computed nunca recalcularia ao digitar ou trocar o status.
    filteredOrders(): Order[] {
        const termo = this.search.toLowerCase().trim();
        return this.orders().filter((order) => {
            const matchSearch =
                !termo ||
                order.client.toLowerCase().includes(termo) ||
                String(order.id).includes(termo);
            const matchStatus =
                this.statusFilter === 'Todos' || order.status === this.statusFilter;
            const matchCliente =
                this.clienteIdFiltro === null || order.clienteId === this.clienteIdFiltro;
            return matchSearch && matchStatus && matchCliente;
        });
    }

    @ViewChild('filtersContainer') filtersContainer?: ElementRef<HTMLDivElement>;
    @ViewChild('filtersTrack') filtersTrack?: ElementRef<HTMLDivElement>;

    readonly dragConstraints = signal<{ top: number; bottom: number; left: number; right: number }>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });


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


