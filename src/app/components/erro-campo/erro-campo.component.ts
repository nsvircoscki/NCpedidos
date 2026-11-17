import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-erro-campo',
  template: `
    @if (estado().touched() && estado().invalid()) {
      <span [id]="id()" class="mt-1 block text-xs font-semibold text-red-600 dark:text-red-400">
        {{ estado().errors()[0].message }}
      </span>
    }
  `,
})
export class ErroCampoComponent {
  readonly campo = input.required<FieldTree<string> | FieldTree<number> | FieldTree<boolean>>();
  readonly id = input.required<string>();

  protected readonly estado = computed(() => this.campo()());
}
