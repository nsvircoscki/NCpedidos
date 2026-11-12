import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Funcionalidade } from '../../models/funcionalidade.model';
import { funcionalidades } from '../../data/funcionalidades';
import { TemaService } from '../../services/tema';


@Component({
    selector:'app-top-header',
    standalone: true,
    imports: [RouterModule, FormsModule, RouterLink],
    templateUrl: './top-header.component.html',
    host: {
        '(document:keydown)': 'aoPressionarTeclaNaPagina($event)',
    }
})
export class TopHeaderComponent {
    private readonly router = inject(Router);
    readonly tema = inject(TemaService);

    readonly Mac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    readonly atalho = this.Mac ? '⌘K' : 'Ctrl+K';

    /** "Pesquisar" separado em letras, para animar cada uma no hover. */
    readonly letrasPesquisar = 'Pesquisar'.split('');

    readonly pesquisaAberta = signal(false);
    readonly termo = signal('');
    readonly indiceAtivo = signal(0);

    private readonly campoPesquisa = viewChild<ElementRef<HTMLInputElement>>('campoPesquisa');
    private readonly botaoPesquisa = viewChild<ElementRef<HTMLButtonElement>>('botaoPesquisa'); 


    readonly resultados = computed(() => {
    const palavras = this.normalizar(this.termo()).split(/\s+/).filter(Boolean);

    if (palavras.length === 0) {
      return funcionalidades;
    }

    return funcionalidades.filter((funcionalidade) => {
      const textoPesquisavel = this.normalizar(
        [
          funcionalidade.titulo,
          funcionalidade.descricao,
          funcionalidade.grupo,
          ...(funcionalidade.palavrasChave ?? []),
        ].join(' ')
      );

      return palavras.every((palavra) => textoPesquisavel.includes(palavra));
    });
  });

  readonly grupos = computed(() => {
    const mapa = new Map<string, Funcionalidade[]>();

    for (const funcionalidade of this.resultados()) {
        const itensDoGrupo = mapa.get(funcionalidade.grupo) ?? [];
        mapa.set(funcionalidade.grupo, [...itensDoGrupo, funcionalidade]);
    }
    return [...mapa].map(([nome, itens]) => ({ nome, itens }));
  });

  constructor() {
    effect(() => {
        this.campoPesquisa()?.nativeElement.focus();
    });
  }

  aoPressionarTeclaNaPagina(evento: KeyboardEvent): void {
    const apertouAtalho = evento.key.toLowerCase() === 'k' && (evento.ctrlKey || evento.metaKey);

    if (apertouAtalho) {
      evento.preventDefault();

      if (this.pesquisaAberta()) {
        this.fecharPesquisa();
      } else {
        this.abrirPesquisa();
      }
      return;
    }

    if (evento.key === 'Escape' && this.pesquisaAberta()) {
      this.fecharPesquisa();
    }
  }

   aoPressionarTeclaNoCampo(evento: KeyboardEvent): void {
    const total = this.resultados().length;
    if (total === 0) return;

    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      this.moverSelecao((this.indiceAtivo() + 1) % total);
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      this.moverSelecao((this.indiceAtivo() - 1 + total) % total);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      this.abrirFuncionalidade(this.resultados()[this.indiceAtivo()]);
    }
  }

  atualizarTermo(evento: Event): void {
    this.termo.set((evento.target as HTMLInputElement).value);
    this.indiceAtivo.set(0);
  }

  moverSelecao(indice: number): void {
    this.indiceAtivo.set(indice);
    document.getElementById(`opcao-pesquisa-${indice}`)?.scrollIntoView({ block: 'nearest'});
  }

  indiceDe(funcionalidade: Funcionalidade): number {
    return this.resultados().indexOf(funcionalidade);
  }

  abrirFuncionalidade(funcionalidade: Funcionalidade): void {
    this.fecharPesquisa();
    this.router.navigateByUrl(funcionalidade.rota);
  }

  abrirPesquisa(): void {
    this.termo.set('');
    this.pesquisaAberta.set(true);
    this.indiceAtivo.set(0);
  }

  fecharPesquisa(): void {
    this.pesquisaAberta.set(false);
    this.botaoPesquisa()?.nativeElement.focus();
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
