import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Navegação entre as telas do administrador: Clientes, Usuários, Tabelas e Registro. */
@Component({
  selector: 'app-abas-admin',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Administração" class="mt-4 flex gap-1 border-b border-slate-200">
      @for (aba of abas; track aba.caminho) {
        <a [routerLink]="aba.caminho" routerLinkActive="border-[#153860] text-[#153860]" ariaCurrentWhenActive="page"
          class="-mb-px border-b-2 border-transparent px-4 py-2 text-sm font-bold text-slate-500 hover:text-[#153860]">
          {{ aba.nome }}
        </a>
      }
    </nav>
  `,
})
export class AbasAdminComponent {
  readonly abas = [
    { nome: 'Clientes', caminho: '/clientes' },
    { nome: 'Usuários', caminho: '/usuarios' },
    { nome: 'Tabelas', caminho: '/tabelas' },
    { nome: 'Registro', caminho: '/auditoria' },
  ];
}
