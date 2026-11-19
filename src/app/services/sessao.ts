import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sessao } from '../models/usuario.model';

const CHAVE_SESSAO = 'sessao';

@Service()
export class SessaoService {
  private readonly http = inject(HttpClient);
  private readonly sessao = signal<Sessao | null>(lerSessaoSalva());

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly logado = computed(() => this.sessao() !== null);
  readonly iniciais = computed(() => (this.usuario()?.nome ?? '').split(' ').slice(0, 2).map(parte => parte[0]).join('').toUpperCase()
  );

  async entrar(email: string, senha: string): Promise<void> {
    const sessao = environment.usarDadosExemplo
      ? sessaoDeExemplo(email)
      : await firstValueFrom(this.http.post<Sessao>('/auth/login', { email, senha }));
    this.guardar(sessao);
  }

  sair(): void {
    this.guardar(null);
  }

  private guardar(sessao: Sessao | null): void {
    this.sessao.set(sessao);
    try {
      if (sessao) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
      else localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      // Navegação privada: a sessão vale só até recarregar a página.
    }
  }
}

function lerSessaoSalva(): Sessao | null {
  try {
    const salva = localStorage.getItem(CHAVE_SESSAO);
    return salva ? JSON.parse(salva) : null;
  } catch {
    return null;
  }
}

function sessaoDeExemplo(email: string): Sessao {
  return { token: 'token-de-exemplo', usuario: { id: 1, nome: 'Camila Moreira', email } };
}