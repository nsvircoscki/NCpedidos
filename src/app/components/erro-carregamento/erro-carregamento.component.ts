import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-erro-carregamento',
    template: `
      <div class="px-5 py-10 text-center" role="alert">
        <p class="text-sm text-slate-500 dark:text-noite-suave">{{ texto() }}</p>
        <button type="button" (click)="tentarDeNovo.emit()" class="botao-acao-secundario mt-3 inline-flex">
          Tentar novamente
        </button>
      </div>
    `,
})
export class ErroCarregamentoComponent {
    readonly texto = input.required<string>();
    readonly tentarDeNovo = output<void>();
}
