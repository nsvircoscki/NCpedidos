import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AtivacaoDoisPassos, RespostaLogin, Sessao, Usuario } from '../models/usuario.model';
import { apagarSalvo, apagarSalvosQueComecamCom, lerSalvo, salvar } from '../utils/armazenamento';
import { PREFIXO_RASCUNHO } from '../utils/pedido-rapido';

const CHAVE_SESSAO = 'sessao';

/**
 * Quem está logado. O login vale pelo cookie que a API grava (HttpOnly: o JavaScript não lê, então um script
 * malicioso não rouba a sessão); aqui fica só o nome e as permissões, para as telas. Se o cookie vencer,
 * a API responde 401 e o `errosApiInterceptor` chama `sair()`.
 */
@Service()
export class SessaoService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessao = signal<Sessao | null>(lerSalvo<Sessao>(CHAVE_SESSAO));

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly logado = computed(() => this.sessao() !== null);
  readonly admin = computed(() => this.usuario()?.admin === true);
  readonly precisaTrocarSenha = computed(() => this.usuario()?.trocarSenha === true);
  readonly precisaAtivarDoisPassos = computed(() => this.admin() && !this.usuario()?.doisPassos);
  readonly iniciais = computed(() => (this.usuario()?.nome ?? '').split(' ').slice(0, 2).map(parte => parte[0]).join('').toUpperCase()
  );

  /** 'codigo': a senha conferiu e falta o código do app autenticador (`confirmarCodigo`). */
  async entrar(usuario: string, senha: string): Promise<'pronto' | 'codigo'> {
    const resposta = environment.usarDadosExemplo
      ? sessaoDeExemplo(usuario)
      : await firstValueFrom(this.http.post<RespostaLogin>('/auth/login', { usuario, senha }));
    if ('precisaCodigo' in resposta) return 'codigo';
    this.iniciar(resposta);
    return 'pronto';
  }

  async confirmarCodigo(codigo: string): Promise<void> {
    this.iniciar(await firstValueFrom(this.http.post<Sessao>('/auth/login/codigo', { codigo })));
  }

  /** A troca derruba as outras sessões; a API grava um cookie novo para este aparelho. */
  async trocarSenha(senhaAtual: string, senhaNova: string): Promise<void> {
    this.guardar(await firstValueFrom(this.http.put<Sessao>('/auth/senha', { senhaAtual, senhaNova })));
  }

  iniciarDoisPassos(): Promise<AtivacaoDoisPassos> {
    return firstValueFrom(this.http.post<AtivacaoDoisPassos>('/auth/dois-passos/iniciar', {}));
  }

  async ativarDoisPassos(codigo: string): Promise<void> {
    this.guardar(await firstValueFrom(this.http.post<Sessao>('/auth/dois-passos/ativar', { codigo })));
  }

  /** O admin editou o próprio cadastro: o nome no topo e no PDF já saem com o dado novo. */
  atualizarUsuario({ id, nome, usuario, admin }: Usuario): void {
    const atual = this.sessao();
    if (atual?.usuario.id === id) this.guardar({ usuario: { ...atual.usuario, id, nome, usuario, admin } });
  }

  sair(): void {
    // O cookie só a API apaga. Se a chamada falhar, ele vence sozinho em até 12 h.
    this.http.post('/auth/sair', {}).subscribe({ error: () => undefined });
    apagarSalvosQueComecamCom(PREFIXO_RASCUNHO);
    this.guardar(null);
    this.router.navigate(['/login']);
  }

  // Todo login começa com o pedido em branco: não sobra pedido de antes neste aparelho (nem de outra pessoa).
  private iniciar(sessao: Sessao): void {
    apagarSalvosQueComecamCom(PREFIXO_RASCUNHO);
    this.guardar(sessao);
  }

  private guardar(sessao: Sessao | null): void {
    this.sessao.set(sessao);
    if (sessao) salvar(CHAVE_SESSAO, sessao);
    else apagarSalvo(CHAVE_SESSAO);
  }
}

function sessaoDeExemplo(usuario: string): Sessao {
  return { usuario: { id: 1, nome: 'Camila Moreira', usuario } };
}
