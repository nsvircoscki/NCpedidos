import { FiltroModalComponent } from '../../components/filtro-modal/filtro-modal.component';
import { FiltroChipsComponent } from '../../components/filtro-modal/filtro-chips.component';
import { PedidoResumo } from '../../models/pedido.model';
import { PEDIDOS_EXEMPLO } from '../../data/pedidos';
import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { PedidoAcompanhamentoComponent } from '../pedido-enviado/pedido-acompanhamento.component';
import { ClienteOption } from '../../models/cliente.model';



@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [FiltroModalComponent, FiltroChipsComponent, 
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
    readonly pedidoSelecionado = signal<PedidoResumo | null>(null);
    search = '';
    statusSelecionados: string[] = [];
    filtrosAbertos = false;
    readonly statusPedido = ['Em análise', 'Aprovado', 'Faturado'];
    readonly statusOptions = ['Todos', ...this.statusPedido];

    get totalFiltrosAtivos(): number {
        return this.statusSelecionados.length + (this.search.trim() ? 1 : 0);
    }

    alternarStatus(status: string): void {
        this.statusSelecionados = this.statusSelecionados.includes(status)
            ? this.statusSelecionados.filter(item => item !== status)
            : [...this.statusSelecionados, status];
    }

    // No mobile os chips escolhem um status por vez; "Todos" limpa a escolha.
    escolherStatusMobile(status: string): void {
        this.statusSelecionados = status === 'Todos' ? [] : [status];
    }

    statusMobileAtivo(status: string): boolean {
        return status === 'Todos'
            ? this.statusSelecionados.length === 0
            : this.statusSelecionados.includes(status);
    }

    limparFiltros(): void {
        this.search = '';
        this.statusSelecionados = [];
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

    private readonly orders = signal<PedidoResumo[]>(PEDIDOS_EXEMPLO);

    // Método (e não computed) porque search/statusSelecionados não são signals:
    // um computed nunca recalcularia ao digitar ou trocar o status.
    filteredOrders(): PedidoResumo[] {
        const termo = this.search.toLowerCase().trim();
        return this.orders().filter((order) => {
            const matchSearch =
                !termo ||
                order.client.toLowerCase().includes(termo) ||
                String(order.id).includes(termo);
            const matchStatus =
                this.statusSelecionados.length === 0 || this.statusSelecionados.includes(order.status);
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

    abrirAcompanhamento(order: PedidoResumo): void {
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


