import { DOCUMENT } from '@angular/common';
import { Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormField, form, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { BotaoVerSenhaComponent } from '../../components/botao-ver-senha/botao-ver-senha.component';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { SessaoService } from '../../services/sessao';
import { motivoDoErro } from '../../utils/erros';

@Component({
  selector: 'app-login',
  imports: [FormField, ErroCampoComponent, BotaoVerSenhaComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly documento = inject(DOCUMENT);

  readonly dados = signal({ usuario: '', senha: '' });
  readonly formulario = form(this.dados, campo => {
    required(campo.usuario, { message: 'Informe o usuário.' });
    required(campo.senha, { message: 'Informe a senha.' });
  });

  /** 'codigo': a senha conferiu e falta o código do app autenticador. */
  readonly etapa = signal<'senha' | 'codigo'>('senha');
  readonly codigo = signal({ codigo: '' });
  readonly formularioCodigo = form(this.codigo, campo => {
    required(campo.codigo, { message: 'Digite o código que aparece no app.' });
    pattern(campo.codigo, /^\d{6}$/, { message: 'O código tem 6 números.' });
  });

  readonly entrando = signal(false);
  readonly erroAoEntrar = signal('');
  readonly mostrarAjudaSenha = signal(false);

  async entrar(evento: Event): Promise<void> {
    evento.preventDefault();
    this.formulario().markAsTouched();
    if (this.formulario().invalid()) return;

    this.entrando.set(true);
    this.erroAoEntrar.set('');
    try {
      const { usuario, senha } = this.dados();
      if ((await this.sessao.entrar(usuario, senha)) === 'pronto') {
        this.router.navigateByUrl('/');
        return;
      }
      this.etapa.set('codigo');
      afterNextRender(() => this.documento.getElementById('codigo')?.focus(), { injector: this.injector });
    } catch (erro) {
      this.erroAoEntrar.set(motivoDoErro(erro, 'Usuário ou senha incorretos.'));
    } finally {
      this.entrando.set(false);
    }
  }

  async confirmarCodigo(evento: Event): Promise<void> {
    evento.preventDefault();
    this.formularioCodigo().markAsTouched();
    if (this.formularioCodigo().invalid()) return;

    this.entrando.set(true);
    this.erroAoEntrar.set('');
    try {
      await this.sessao.confirmarCodigo(this.codigo().codigo);
      this.router.navigateByUrl('/');
    } catch (erro) {
      this.erroAoEntrar.set(motivoDoErro(erro, 'Código incorreto.'));
    } finally {
      this.entrando.set(false);
    }
  }

  voltarParaSenha(): void {
    this.etapa.set('senha');
    this.codigo.set({ codigo: '' });
    this.formularioCodigo().reset();
    this.erroAoEntrar.set('');
  }
}