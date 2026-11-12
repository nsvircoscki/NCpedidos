import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { NgmMotionDirective, useMotionValue, useSpring, useTransform, useVelocity, type MotionStyle } from '@scripttype/ng-motion';

/**
 * Botão hambúrguer que abre o modal de filtros com pop-in e efeito gelatina.
 * O conteúdo do modal (grupos de filtro, ordenação) vem de quem usa o componente.
 */
@Component({
  selector: 'app-filtro-modal',
  imports: [NgmMotionDirective],
  templateUrl: './filtro-modal.component.html',
  host: {
    '(document:keydown.escape)': 'fechar()',
    '(window:resize)': 'atualizarLimites()',
  },
})
export class FiltroModalComponent {
  readonly totalAtivos = input(0);
  readonly totalResultados = input(0);
  readonly nomeResultados = input('resultados');

  readonly limpar = output<void>();

  readonly aberto = signal(false);

  private readonly modal = viewChild<ElementRef<HTMLElement>>('modal');
  private readonly margemDaTela = 16;
  readonly limitesArrasto = signal({ left: 0, right: 0, top: 0, bottom: 0 });

  readonly arrastoX = useMotionValue(0);
  private readonly velocidadeX = useVelocity(this.arrastoX);

  private readonly molaDeformacao = { stiffness: 320, damping: 16, mass: 0.34 };
  private readonly molaEsticar = { stiffness: 360, damping: 14, mass: 0.4 };

  readonly estiloArrasto: MotionStyle = {
    x: this.arrastoX,
    rotate: useSpring(useTransform(this.velocidadeX, [-3200, 0, 3200], [-8, 0, 8]), this.molaDeformacao),
    skewY: useSpring(useTransform(this.velocidadeX, [-3200, 0, 3200], [6, 0, -6]), this.molaDeformacao),
    rotateY: useSpring(useTransform(this.velocidadeX, [-3200, 0, 3200], [-20, 0, 20]), this.molaDeformacao),
    scaleX: useSpring(useTransform(this.velocidadeX, [-3200, 0, 3200], [1.12, 1, 1.12]), this.molaEsticar),
    scaleY: useSpring(useTransform(this.velocidadeX, [-3200, 0, 3200], [0.92, 1, 0.92]), this.molaEsticar),
    transformPerspective: 900,
  };

  alternar(): void {
    this.aberto.update(aberto => !aberto);
    if (this.aberto()) {
      this.atualizarLimites();
    }
  }

  fechar(): void {
    this.aberto.set(false);
  }

  // O modal começa no centro: o espaço livre de cada lado é metade do que sobra da tela.
  atualizarLimites(): void {
    const modal = this.modal()?.nativeElement;
    if (!modal) return;

    const espacoLivre = Math.max(0, (window.innerWidth - modal.offsetWidth) / 2 - this.margemDaTela);
    this.limitesArrasto.set({ left: -espacoLivre, right: espacoLivre, top: 0, bottom: 0 });

    const x = this.arrastoX.get();
    if (Math.abs(x) > espacoLivre) {
      this.arrastoX.set(Math.sign(x) * espacoLivre);
    }
  }
}
