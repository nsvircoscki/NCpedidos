import { Component, input, output } from '@angular/core';

/** Um grupo de filtro dentro do modal: título + chips que marcam e desmarcam. */
@Component({
  selector: 'app-filtro-chips',
  template: `
    <h3 class="mb-2 mt-5 text-[10px] font-bold uppercase tracking-wide text-slate-400">{{ titulo() }}</h3>
    <div class="flex flex-wrap gap-2">
      @for (opcao of opcoes(); track opcao) {
        <button
          type="button"
          (click)="alternar.emit(opcao)"
          [attr.aria-pressed]="estaMarcado(opcao)"
          class="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors"
          [class.border-[#153860]]="estaMarcado(opcao)"
          [class.bg-[#153860]]="estaMarcado(opcao)"
          [class.text-white]="estaMarcado(opcao)"
          [class.dark:border-noite-marca]="estaMarcado(opcao)"
          [class.border-slate-200]="!estaMarcado(opcao)"
          [class.text-slate-600]="!estaMarcado(opcao)"
          [class.hover:bg-slate-50]="!estaMarcado(opcao)"
          [class.dark:border-noite-borda]="!estaMarcado(opcao)"
          [class.dark:text-slate-300]="!estaMarcado(opcao)"
          [class.dark:hover:bg-noite-sutil]="!estaMarcado(opcao)">
          {{ textoDe()(opcao) }}
        </button>
      }
    </div>
  `,
})
export class FiltroChipsComponent {
  readonly titulo = input.required<string>();
  readonly opcoes = input.required<string[]>();
  readonly selecionados = input.required<string[]>();
  readonly textoDe = input<(opcao: string) => string>(opcao => opcao);

  readonly alternar = output<string>();

  estaMarcado(opcao: string): boolean {
    return this.selecionados().includes(opcao);
  }
}
