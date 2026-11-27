import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DadosUsuario, NovoUsuario, UsuarioCadastrado } from '../models/usuario.model';
import { carregarDados } from './carregar-dados';

/** Usuários do sistema, para o administrador. A API recusa (403) quem não é admin. */
// Nos providers da tela Usuários: a lista só é buscada quando o admin abre a tela.
@Injectable()
export class UsuariosStore {
  private readonly http = inject(HttpClient);
  private readonly recurso = carregarDados<UsuarioCadastrado[]>('/usuarios', []);
  readonly usuarios = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  async criar(usuario: NovoUsuario): Promise<UsuarioCadastrado> {
    const criado = await firstValueFrom(this.http.post<UsuarioCadastrado>('/usuarios', usuario));
    this.recurso.update(lista => [...(lista ?? []), criado].sort(porNome));
    return criado;
  }

  async editar(id: number, dados: DadosUsuario): Promise<UsuarioCadastrado> {
    const alterado = await firstValueFrom(this.http.put<UsuarioCadastrado>(`/usuarios/${id}`, dados));
    this.recurso.update(lista => (lista ?? []).map(usuario => (usuario.id === id ? alterado : usuario)).sort(porNome));
    return alterado;
  }

  async excluir(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/usuarios/${id}`));
    this.recurso.update(lista => (lista ?? []).filter(usuario => usuario.id !== id));
  }

  async alterarSenha(id: number, senha: string): Promise<void> {
    await firstValueFrom(this.http.put<void>(`/usuarios/${id}/senha`, { senha }));
  }
}

function porNome(a: UsuarioCadastrado, b: UsuarioCadastrado): number {
  return a.nome.localeCompare(b.nome);
}
