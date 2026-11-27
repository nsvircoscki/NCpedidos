import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AbasAdminComponent } from '../../components/abas-admin/abas-admin.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { AuditoriaStore } from '../../services/auditoria-store';
import { filtrarPorTexto } from '../../utils/texto';

// Ações que podem ser alguém tentando adivinhar senha: aparecem em destaque.
const SUSPEITAS = new Set(['login recusado', 'errou a senha atual ao trocar']);

@Component({
  selector: 'app-auditoria',
  imports: [DatePipe, RouterLink, AbasAdminComponent, ErroCarregamentoComponent, EsqueletoListaComponent],
  providers: [AuditoriaStore],
  templateUrl: './auditoria.component.html',
})
export class AuditoriaComponent {
  private readonly store = inject(AuditoriaStore);

  readonly carregando = this.store.carregando;
  readonly erro = this.store.erro;
  readonly busca = signal('');
  readonly registros = computed(() =>
    filtrarPorTexto(this.store.registros(), this.busca(), r => `${r.usuario} ${r.acao} ${r.detalhe} ${r.ip}`),
  );

  suspeita(acao: string): boolean {
    return SUSPEITAS.has(acao);
  }

  recarregar(): void {
    this.store.recarregar();
  }
}
