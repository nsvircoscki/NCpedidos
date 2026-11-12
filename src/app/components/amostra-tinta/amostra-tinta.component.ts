import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

/**
 * Cartão de número no formato de amostra de tinta: bloco de cor com o valor e, embaixo,
 * ícone + rótulo. O que vem depois do rótulo (variação, legenda) entra pelo ng-content.
 */
@Component({
  selector: 'app-amostra-tinta',
  imports: [DecimalPipe],
  host: { class: 'flex flex-col' },
  template: `
    <div class="flex h-28 items-end px-4 pb-3" [style.background-color]="cor()" [style.color]="corTexto()">
      <strong class="text-[44px] font-bold leading-none tracking-tight">{{ valor() | number }}</strong>
    </div>
    <div class="flex flex-col gap-1 px-4 py-3">
      <span class="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[#0f172a] dark:text-noite-texto">
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f7f8fa] dark:bg-noite-sutil">
          <img [src]="icone()" alt="" />
        </span>
        <span class="truncate">{{ rotulo() }}</span>
      </span>
      <ng-content />
    </div>
  `,
})
export class AmostraTintaComponent {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<number>();
  readonly icone = input.required<string>();
  readonly cor = input.required<string>();
  readonly corTexto = input('#ffffff');
}
