import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { SessaoService } from '../../services/sessao';

@Component({
  selector: 'app-login',
  imports: [FormField, ErroCampoComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);

  readonly dados = signal({ email: '', senha: '' });
  readonly formulario = form(this.dados, campo => {
    required(campo.email, { message: 'Informe o e-mail.' });
    email(campo.email, { message: 'E-mail inválido.' });
    required(campo.senha, { message: 'Informe a senha.' });
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
      const { email, senha } = this.dados();
      await this.sessao.entrar(email, senha);
      this.router.navigateByUrl('/');
    } catch {
      this.erroAoEntrar.set('E-mail ou senha incorretos.');
    } finally {
      this.entrando.set(false);
    }
  }
}