import { DOCUMENT } from '@angular/common';
import { Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormField, disabled, form, maxLength, minLength, pattern, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AbasAdminComponent } from '../../components/abas-admin/abas-admin.component';
import { BotaoVerSenhaComponent } from '../../components/botao-ver-senha/botao-ver-senha.component';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { DadosUsuario, NovoUsuario, UsuarioCadastrado } from '../../models/usuario.model';
import { SessaoService } from '../../services/sessao';
import { UsuariosStore } from '../../services/usuarios-store';
import { motivoDoErro } from '../../utils/erros';

const USUARIO_VAZIO: NovoUsuario = { nome: '', usuario: '', senha: '', admin: false };
// O mesmo formato que a API aceita (login.ts): o login é sempre em minúsculas.
const USUARIO_VALIDO = /^[a-zA-Z0-9._-]{2,40}$/;

@Component({
  selector: 'app-usuarios',
  imports: [FormField, RouterLink, AbasAdminComponent, BotaoVerSenhaComponent, ErroCampoComponent, ErroCarregamentoComponent, EsqueletoListaComponent],
  providers: [UsuariosStore],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  private readonly store = inject(UsuariosStore);
  private readonly sessao = inject(SessaoService);
  private readonly injector = inject(Injector);
  private readonly documento = inject(DOCUMENT);

  readonly usuarios = this.store.usuarios;
  readonly carregando = this.store.carregando;
  readonly erro = this.store.erro;

  readonly dados = signal<NovoUsuario>({ ...USUARIO_VAZIO });
  readonly formulario = form(this.dados, campo => {
    required(campo.nome, { message: 'Informe o nome.' });
    required(campo.usuario, { message: 'Informe o usuário.' });
    pattern(campo.usuario, USUARIO_VALIDO, { message: 'Use de 2 a 40 letras sem acento, números, ponto ou traço.' });
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
      const usuario = await this.store.criar({ ...this.dados(), nome: this.dados().nome.trim(), usuario: login(this.dados().usuario) });
      this.criado.set(`${usuario.nome} já pode entrar com o usuário ${usuario.usuario}. A senha é provisória: no primeiro login a pessoa cria a dela.`);
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
  /** Confirmação da troca de senha ou da edição, mostrada na linha do usuário (a lista é longa). */
  readonly aviso = signal<{ usuarioId: number; texto: string } | null>(null);

  abrirTrocaDeSenha(usuario: UsuarioCadastrado): void {
    this.editando.set(null);
    this.excluindo.set(null);
    this.trocandoSenhaDe.set(usuario);
    this.novaSenha.set({ senha: '' });
    this.formularioSenha().reset();
    this.erroSenha.set('');
    this.aviso.set(null);
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
      this.aviso.set({
        usuarioId: usuario.id,
        texto: 'Senha alterada. Passe para a pessoa: é provisória, e no próximo login ela cria a dela. A verificação em duas etapas dela foi desligada.',
      });
      this.trocandoSenhaDe.set(null);
    } catch (erro) {
      this.erroSenha.set(motivoDoErro(erro, 'Não foi possível alterar a senha. Tente de novo.'));
    } finally {
      this.salvandoSenha.set(false);
    }
  }

  // Edição do cadastro (nome, e-mail e admin): abre um formulário na linha do usuário escolhido.
  readonly editando = signal<UsuarioCadastrado | null>(null);
  readonly dadosEdicao = signal<DadosUsuario>({ nome: '', usuario: '', admin: false });
  readonly formularioEdicao = form(this.dadosEdicao, campo => {
    required(campo.nome, { message: 'Informe o nome.' });
    maxLength(campo.nome, 120, { message: 'Use no máximo 120 caracteres.' });
    required(campo.usuario, { message: 'Informe o usuário.' });
    pattern(campo.usuario, USUARIO_VALIDO, { message: 'Use de 2 a 40 letras sem acento, números, ponto ou traço.' });
    // A API também recusa: sem isso o último admin poderia se trancar fora desta tela.
    disabled(campo.admin, () => this.editando()?.id === this.sessao.usuario()?.id);
  });
  readonly salvandoEdicao = signal(false);
  readonly erroEdicao = signal('');

  abrirEdicao(usuario: UsuarioCadastrado): void {
    this.trocandoSenhaDe.set(null);
    this.excluindo.set(null);
    this.editando.set(usuario);
    this.dadosEdicao.set({ nome: usuario.nome, usuario: usuario.usuario, admin: usuario.admin });
    this.formularioEdicao().reset();
    this.erroEdicao.set('');
    this.aviso.set(null);
    afterNextRender(() => this.documento.getElementById(`editar-nome-${usuario.id}`)?.focus(), { injector: this.injector });
  }

  cancelarEdicao(): void {
    this.editando.set(null);
  }

  async salvarEdicao(evento: Event): Promise<void> {
    evento.preventDefault();
    const usuario = this.editando();
    this.formularioEdicao().markAsTouched();
    if (!usuario || this.formularioEdicao().invalid()) return;

    this.salvandoEdicao.set(true);
    this.erroEdicao.set('');
    try {
      const dados = this.dadosEdicao();
      const alterado = await this.store.editar(usuario.id, { ...dados, nome: dados.nome.trim(), usuario: login(dados.usuario) });
      this.sessao.atualizarUsuario(alterado);
      this.aviso.set({ usuarioId: usuario.id, texto: 'Cadastro atualizado.' });
      this.editando.set(null);
    } catch (erro) {
      this.erroEdicao.set(motivoDoErro(erro, 'Não foi possível salvar o cadastro. Tente de novo.'));
    } finally {
      this.salvandoEdicao.set(false);
    }
  }

  // Exclusão: pede confirmação na linha do usuário, avisando quantos clientes vão junto.
  readonly meuId = computed(() => this.sessao.usuario()?.id);
  readonly excluindo = signal<UsuarioCadastrado | null>(null);
  readonly erroExclusao = signal('');
  readonly excluido = signal('');

  pedirExclusao(usuario: UsuarioCadastrado): void {
    this.trocandoSenhaDe.set(null);
    this.editando.set(null);
    this.erroExclusao.set('');
    this.excluido.set('');
    this.aviso.set(null);
    this.excluindo.set(usuario);
  }

  async confirmarExclusao(): Promise<void> {
    const usuario = this.excluindo();
    if (!usuario) return;
    this.erroExclusao.set('');
    try {
      await this.store.excluir(usuario.id);
      this.excluido.set(`${usuario.nome} excluído.`);
      this.excluindo.set(null);
    } catch (erro) {
      this.erroExclusao.set(motivoDoErro(erro, 'Não foi possível excluir o usuário. Tente de novo.'));
    }
  }

  recarregar(): void {
    this.store.recarregar();
  }
}

function login(usuario: string): string {
  return usuario.trim().toLowerCase();
}
