import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, pattern, required, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { BotaoVerSenhaComponent } from '../../components/botao-ver-senha/botao-ver-senha.component';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { AtivacaoDoisPassos } from '../../models/usuario.model';
import { SessaoService } from '../../services/sessao';
import { motivoDoErro } from '../../utils/erros';

/** Senha e verificação em duas etapas de quem está logado. */
@Component({
  selector: 'app-minha-conta',
  imports: [FormField, RouterLink, BotaoVerSenhaComponent, ErroCampoComponent],
  templateUrl: './minha-conta.component.html',
})
export class MinhaContaComponent {
  private readonly sessao = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly documento = inject(DOCUMENT);

  /** Senha dada pelo admin: a pessoa só usa o sistema depois de criar a sua. */
  readonly provisoria = this.sessao.precisaTrocarSenha;
  readonly doisPassosAtivo = computed(() => this.sessao.usuario()?.doisPassos === true);
  readonly obrigatorioParaAdmin = this.sessao.precisaAtivarDoisPassos;

  readonly dados = signal({ senhaAtual: '', senhaNova: '', confirmacao: '' });
  readonly formulario = form(this.dados, campo => {
    required(campo.senhaAtual, { message: 'Informe a senha atual.' });
    required(campo.senhaNova, { message: 'Informe a senha nova.' });
    minLength(campo.senhaNova, 8, { message: 'Use pelo menos 8 caracteres.' });
    validate(campo.confirmacao, ({ value, valueOf }) =>
      value() === valueOf(campo.senhaNova) ? null : { kind: 'confirmacao', message: 'As duas senhas não estão iguais.' });
  });
  readonly salvando = signal(false);
  readonly erroAoSalvar = signal('');
  readonly senhaTrocada = signal(false);

  async salvar(evento: Event): Promise<void> {
    evento.preventDefault();
    this.formulario().markAsTouched();
    if (this.formulario().invalid()) return;

    const eraProvisoria = this.provisoria();
    this.salvando.set(true);
    this.erroAoSalvar.set('');
    this.senhaTrocada.set(false);
    try {
      const { senhaAtual, senhaNova } = this.dados();
      await this.sessao.trocarSenha(senhaAtual, senhaNova);
      if (eraProvisoria) {
        this.router.navigateByUrl('/');
        return;
      }
      this.senhaTrocada.set(true);
      this.dados.set({ senhaAtual: '', senhaNova: '', confirmacao: '' });
      this.formulario().reset();
    } catch (erro) {
      this.erroAoSalvar.set(motivoDoErro(erro, 'Não foi possível trocar a senha. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  // Verificação em duas etapas: a API manda a chave, a pessoa põe no app e confirma com o primeiro código.
  readonly ativacao = signal<AtivacaoDoisPassos | null>(null);
  readonly chaveEmGrupos = computed(() => this.ativacao()?.segredo.match(/.{1,4}/g)?.join(' ') ?? '');
  readonly codigo = signal({ codigo: '' });
  readonly formularioCodigo = form(this.codigo, campo => {
    required(campo.codigo, { message: 'Digite o código que aparece no app.' });
    pattern(campo.codigo, /^\d{6}$/, { message: 'O código tem 6 números.' });
  });
  readonly ativando = signal(false);
  readonly erroDoisPassos = signal('');

  async comecarDoisPassos(): Promise<void> {
    this.erroDoisPassos.set('');
    try {
      this.ativacao.set(await this.sessao.iniciarDoisPassos());
    } catch (erro) {
      this.erroDoisPassos.set(motivoDoErro(erro, 'Não foi possível começar. Tente de novo.'));
    }
  }

  // O Angular bloqueia links "otpauth:" no template (só aceita http, mailto...); a navegação vai por aqui.
  abrirNoApp(): void {
    const link = this.ativacao()?.link;
    if (link) this.documento.location.href = link;
  }

  async confirmarDoisPassos(evento: Event): Promise<void> {
    evento.preventDefault();
    this.formularioCodigo().markAsTouched();
    if (this.formularioCodigo().invalid()) return;

    this.ativando.set(true);
    this.erroDoisPassos.set('');
    try {
      await this.sessao.ativarDoisPassos(this.codigo().codigo);
      this.ativacao.set(null);
    } catch (erro) {
      this.erroDoisPassos.set(motivoDoErro(erro, 'Não foi possível ativar. Tente de novo.'));
    } finally {
      this.ativando.set(false);
    }
  }

  sair(): void {
    this.sessao.sair();
  }
}
