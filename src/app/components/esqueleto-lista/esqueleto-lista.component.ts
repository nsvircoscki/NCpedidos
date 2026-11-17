import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-esqueleto-lista',
  template: `
    <div role="status">
      <span class="sr-only">{{ texto() }}</span>
      @if (formato() === 'grade') {
        <div aria-hidden="true" class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          @for (indice of indices(); track indice) {
            <div class="overflow-hidden rounded-[14px] border border-[#e3e9ee] bg-white p-3 dark:border-noite-borda dark:bg-noite-card">
              <span [class]="bloco + ' block aspect-square rounded-[10px]'"></span>
              <span [class]="bloco + ' mt-3 block h-3 w-4/5 rounded'"></span>
              <span [class]="bloco + ' mt-2 block h-3 w-2/5 rounded'"></span>
            </div>
          }
        </div>
      } @else {
        <ul aria-hidden="true">
          @for (indice of indices(); track indice) {
            <li class="flex items-center gap-3 border-b border-[#e2e8f0] px-5 py-4 last:border-b-0 dark:border-noite-borda">
              <span [class]="bloco + ' h-10 w-10 shrink-0 rounded-full'"></span>
              <span class="flex-1 space-y-2">
                <span [class]="bloco + ' block h-3 w-2/5 rounded'"></span>
                <span [class]="bloco + ' block h-3 w-1/4 rounded'"></span>
              </span>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class EsqueletoListaComponent {
  readonly linhas = input(5);
  readonly texto = input('Carregando...');
  readonly formato = input<'lista' | 'grade'>('lista');
  readonly indices = computed(() => Array.from({ length: this.linhas() }, (_, i) => i));

  protected readonly bloco = 'animate-pulse bg-slate-200 motion-reduce:animate-none dark:bg-noite-sutil';
}
