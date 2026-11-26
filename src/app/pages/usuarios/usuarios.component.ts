import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormField, email, form, minLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { NovoUsuario, UsuarioCadastrado } from '../../models/usuario.model';
import { UsuariosStore } from '../../services/usuarios-store';

const USUARIO_VAZIO: NovoUsuario = { nome: '', email: '', senha: '', admin: false };

@Component({
  selector: 'app-usuarios',
  imports: [FormField, RouterLink, ErroCampoComponent, ErroCarregamentoComponent, EsqueletoListaComponent],
  providers: [UsuariosStore],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  private readonly store = inject(UsuariosStore);
  private readonly injector = inject(Injector);
  private readonly documento = inject(DOCUMENT);

  readonly usuarios = this.store.usuarios;
  readonly carregando = this.store.carregando;
  readonly erro = this.store.erro;

  readonly dados = signal<NovoUsuario>({ ...USUARIO_VAZIO });
  readonly formulario = form(this.dados, campo => {
    required(campo.nome, { message: 'Informe o nome.' });
    required(campo.email, { message: 'Informe o e-mail.' });
    email(campo.email, { message: 'E-mail inválido.' });
    required(campo.senha, { message: 'Informe a senha.' });
    minLength(campo.senha, 8, { message: 'Use pelo menos 8 caracteres.' });
  });

  readonly salvando = signal(false);
  readonly erroAoSalvar = signal('');
  readonly criado = signal('');

  async criar(evento: Event): Promise<void> {
    evento.preventDefault();
    this.formulario().markAsTouched();
    if (this.formulario().invalid()) return;

    this.salvando.set(true);
    this.erroAoSalvar.set('');
    this.criado.set('');
    try {
      const usuario = await this.store.criar({ ...this.dados(), nome: this.dados().nome.trim(), email: this.dados().email.trim() });
      this.criado.set(`${usuario.nome} já pode entrar com ${usuario.email}.`);
      this.dados.set({ ...USUARIO_VAZIO });
      this.formulario().reset();
    } catch (erro) {
      this.erroAoSalvar.set(motivoDoErro(erro, 'Não foi possível criar o usuário. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  // Troca de senha: abre um campo na linha do usuário escolhido.
  readonly trocandoSenhaDe = signal<UsuarioCadastrado | null>(null);
  readonly novaSenha = signal({ senha: '' });
  readonly formularioSenha = form(this.novaSenha, campo => {
    required(campo.senha, { message: 'Informe a nova senha.' });
    minLength(campo.senha, 8, { message: 'Use pelo menos 8 caracteres.' });
  });
  readonly salvandoSenha = signal(false);
  readonly erroSenha = signal('');
  readonly senhaAlterada = signal('');

  abrirTrocaDeSenha(usuario: UsuarioCadastrado): void {
    this.trocandoSenhaDe.set(usuario);
    this.novaSenha.set({ senha: '' });
    this.formularioSenha().reset();
    this.erroSenha.set('');
    this.senhaAlterada.set('');
    afterNextRender(() => this.documento.getElementById(`nova-senha-${usuario.id}`)?.focus(), { injector: this.injector });
  }

  cancelarTrocaDeSenha(): void {
    this.trocandoSenhaDe.set(null);
  }

  async salvarSenha(evento: Event): Promise<void> {
    evento.preventDefault();
    const usuario = this.trocandoSenhaDe();
    this.formularioSenha().markAsTouched();
    if (!usuario || this.formularioSenha().invalid()) return;

    this.salvandoSenha.set(true);
    this.erroSenha.set('');
    try {
      await this.store.alterarSenha(usuario.id, this.novaSenha().senha);
      this.senhaAlterada.set(`Senha de ${usuario.nome} alterada. Passe a nova senha para a pessoa.`);
      this.trocandoSenhaDe.set(null);
    } catch (erro) {
      this.erroSenha.set(motivoDoErro(erro, 'Não foi possível alterar a senha. Tente de novo.'));
    } finally {
      this.salvandoSenha.set(false);
    }
  }

  recarregar(): void {
    this.store.recarregar();
  }
}

// A API explica o motivo (e-mail repetido, senha curta); sem resposta, é a conexão.
function motivoDoErro(erro: unknown, padrao: string): string {
  return (erro instanceof HttpErrorResponse ? erro.error?.erro : null) ?? padrao;
}
