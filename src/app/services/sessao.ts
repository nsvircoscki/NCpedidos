import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sessao } from '../models/usuario.model';
import { Router } from '@angular/router';
import { apagarSalvo, lerSalvo, salvar } from '../utils/armazenamento';

const CHAVE_SESSAO = 'sessao';

@Service()
export class SessaoService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessao = signal<Sessao | null>(lerSalvo<Sessao>(CHAVE_SESSAO));

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly logado = computed(() => this.sessao() !== null);
  readonly admin = computed(() => this.usuario()?.admin === true);
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
    this.router.navigate(['/login']);
  }

  private guardar(sessao: Sessao | null): void {
    this.sessao.set(sessao);
    if (sessao) salvar(CHAVE_SESSAO, sessao);
    else apagarSalvo(CHAVE_SESSAO);
  }
}

function sessaoDeExemplo(email: string): Sessao {
  return { token: 'token-de-exemplo', usuario: { id: 1, nome: 'Camila Moreira', email } };
}