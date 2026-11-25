import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { FiltroModalComponent } from '../../components/filtro-modal/filtro-modal.component';
import { FiltroChipsComponent } from '../../components/filtro-modal/filtro-chips.component';
import { PedidosStore } from '../../services/pedidos-store';
import { Component, inject, signal, linkedSignal, ElementRef, ViewChild, AfterViewInit, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';




@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [EsqueletoListaComponent, FiltroModalComponent, FiltroChipsComponent, 
        CommonModule,
        FormsModule,
        RouterLink,
        NgmMotionDirective,
        ErroCarregamentoComponent,
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

    readonly sent = signal(false);
    readonly search = signal('');
    readonly statusSelecionados = signal<string[]>([]);
    filtrosAbertos = false;
    readonly statusPedido = ['Em análise', 'Aprovado', 'Recusado', 'Faturado'];
    readonly statusOptions = ['Todos', ...this.statusPedido];

    get totalFiltrosAtivos(): number {
        return this.statusSelecionados().length + (this.search().trim() ? 1 : 0);
    }

    alternarStatus(status: string): void {
        this.statusSelecionados.update(lista => lista.includes(status)
            ? lista.filter(item => item !== status)
            : [...lista, status])
    }

    // No mobile os chips escolhem um status por vez; "Todos" limpa a escolha.
    escolherStatusMobile(status: string): void {
        this.statusSelecionados.set(status === 'Todos' ? [] : [status]);
    }

    statusMobileAtivo(status: string): boolean {
        return status === 'Todos'
            ? this.statusSelecionados().length === 0
            : this.statusSelecionados().includes(status);
    }

    limparFiltros(): void {
        this.search.set('');
        this.statusSelecionados.set([]);
    }


    iniciais(nome: string): string {
        return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
    }

    private readonly pedidosStore = inject(PedidosStore);
    private readonly orders = this.pedidosStore.pedidos;
    readonly carregando = this.pedidosStore.carregando;
    readonly erro = this.pedidosStore.erro;

    recarregar(): void {
        this.pedidosStore.recarregar();
    }


     readonly filteredOrders = computed(() => {
        const termo = this.search().toLowerCase().trim();
        return this.orders().filter((order) => {
            const matchSearch =
                !termo ||
                order.client.toLowerCase().includes(termo) ||
                String(order.id).includes(termo);
            const matchStatus =
                this.statusSelecionados().length === 0 || this.statusSelecionados().includes(order.status);
            const matchCliente =
                this.clienteIdFiltro === null || order.clienteId === this.clienteIdFiltro;
            return matchSearch && matchStatus && matchCliente;
        });
     });     
    

    readonly itensPorPagina = 5;
    readonly paginaAtual = linkedSignal({
        source: this.filteredOrders,
        computation: () => 1,
    });

    readonly totalPaginas = computed(() => 
        Math.max(1, Math.ceil(this.filteredOrders().length / this.itensPorPagina)));
    
    readonly pedidosDaPagina = computed(() => {
        const inicio = (this.paginaAtual() -1)* this.itensPorPagina;
        return this.filteredOrders().slice(inicio, inicio + this.itensPorPagina);
    });

    irParaPagina(numero: number): void {
        this.paginaAtual.set(numero);
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

    currency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }
}


