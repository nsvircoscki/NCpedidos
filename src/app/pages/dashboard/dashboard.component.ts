import { AmostraTintaComponent } from '../../components/amostra-tinta/amostra-tinta.component';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PedidosStore } from '../../services/pedidos-store';
import { NgmMotionDirective, type Transition } from '@scripttype/ng-motion';

interface Amostra {
    rotulo: string;
    icone: string;
    valor: number;
    variacao: string;
    subiu: boolean;
    cor: string;
    corTexto: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, NgmMotionDirective, AmostraTintaComponent],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    // ---- Cards arrastáveis (ngMotion: drag + layout) ----

    /** Ordem dos cards no grid. Trocar a ordem dispara a animação de layout dos cards. */
    readonly widgets = signal(['total', 'novos', 'processamento', 'completos']);

    /** Card sendo arrastado (fica por cima dos outros). */
    readonly widgetArrastado = signal<string | null>(null);

    /** Mola usada quando os cards trocam de lugar e quando o card solto volta ao grid. */
    readonly transicaoCards: Transition = { type: 'spring', stiffness: 420, damping: 34 };

    private readonly gradeWidgets = viewChild<ElementRef<HTMLElement>>('gradeWidgets');

    /**
     * Centro de cada posição do grid, relativo à própria grade, medido no início do arraste.
     * Medir a cada arraste deixa a troca correta com 2 ou 4 colunas (grid responsivo).
     */
    private posicoes: { x: number; y: number; largura: number; altura: number }[] = [];

    iniciarArraste(widget: string): void {
        this.widgetArrastado.set(widget);

        const grade = this.gradeWidgets()?.nativeElement;
        if (!grade) return;

        // offsetLeft/offsetTop ignoram transform, então medem a posição real no grid
        // mesmo que algum card ainda esteja terminando uma animação.
        this.posicoes = Array.from(grade.children as HTMLCollectionOf<HTMLElement>).map((card) => ({
            x: card.offsetLeft + card.offsetWidth / 2,
            y: card.offsetTop + card.offsetHeight / 2,
            largura: card.offsetWidth,
            altura: card.offsetHeight,
        }));
    }

    /** Chamado a cada movimento: se o centro do card entrou em outra posição do grid, reordena. */
    moverArraste(card: HTMLElement): void {
        const widget = this.widgetArrastado();
        const grade = this.gradeWidgets()?.nativeElement;
        if (!widget || !grade || !this.posicoes.length) return;

        // Centro atual do card (inclui o deslocamento do arraste), relativo à grade.
        const retanguloGrade = grade.getBoundingClientRect();
        const retanguloCard = card.getBoundingClientRect();
        const centroX = retanguloCard.left + retanguloCard.width / 2 - retanguloGrade.left;
        const centroY = retanguloCard.top + retanguloCard.height / 2 - retanguloGrade.top;

        // Só troca quando o centro do card está dentro da área de outra posição,
        // assim a ordem não fica "piscando" quando o card passa pela fresta entre dois.
        const destino = this.posicoes.findIndex((posicao) =>
            Math.abs(centroX - posicao.x) < posicao.largura / 2 &&
            Math.abs(centroY - posicao.y) < posicao.altura / 2
        );

        const atual = this.widgets().indexOf(widget);
        if (destino === -1 || destino === atual) return;

        this.widgets.update((lista) => {
            const novaLista = [...lista];
            novaLista.splice(atual, 1);
            novaLista.splice(destino, 0, widget);
            return novaLista;
        });
    }

    finalizarArraste(): void {
        this.widgetArrastado.set(null);
        this.posicoes = [];
    }

    private readonly router = inject(Router);
    private readonly pedidos = inject(PedidosStore).pedidos();

    readonly pedidosRecentes = this.pedidos.slice(0, 5);
    readonly totalPedidos = this.pedidos.length;
    readonly novosPedidos = this.contarPorStatus('Em análise');
    readonly emProcessamento = this.contarPorStatus('Aprovado');
    readonly completos = this.contarPorStatus('Faturado');
    dataAtual = new Date();

    // Cada cartão é uma amostra de tinta: a cor identifica a situação do pedido.
    readonly amostras: Record<string, Amostra> = {
        total: { rotulo: 'Total de pedidos', icone: 'assets/totalPedidosIcon.svg', valor: this.totalPedidos, variacao: '+0,00%', subiu: true, cor: 'var(--color-tinta-marinho)', corTexto: '#ffffff' },
        novos: { rotulo: 'Novos pedidos', icone: 'assets/novosPedidosIcon.svg', valor: this.novosPedidos, variacao: '+0,00%', subiu: true, cor: 'var(--color-tinta-ocre)', corTexto: '#2b1d03' },
        processamento: { rotulo: 'Em processamento', icone: 'assets/loadingIcon.svg', valor: this.emProcessamento, variacao: '-0,00%', subiu: false, cor: 'var(--color-tinta-anil)', corTexto: '#ffffff' },
        completos: { rotulo: 'Completos', icone: 'assets/completeIcon.svg', valor: this.completos, variacao: '+0,00%', subiu: true, cor: 'var(--color-tinta-musgo)', corTexto: '#ffffff' },
    };

    abrirPedido(id: number): void {
        this.router.navigate(['/pedidos', id]);
    }

    private contarPorStatus(status: string): number {
        return this.pedidos.filter(pedido => pedido.status === status).length;
    }
}