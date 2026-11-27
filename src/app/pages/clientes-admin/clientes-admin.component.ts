import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AbasAdminComponent } from '../../components/abas-admin/abas-admin.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { FormularioClienteComponent } from '../../components/formulario-cliente/formulario-cliente.component';
import { ClienteDoRepresentante, DadosCliente } from '../../models/pedido-rapido.model';
import { ClientesAdminStore } from '../../services/clientes-admin-store';
import { TabelasAdminStore } from '../../services/tabelas-admin-store';
import { UsuariosStore } from '../../services/usuarios-store';
import { motivoDoErro } from '../../utils/erros';
import { filtrarPorTexto } from '../../utils/texto';

/** Tela do admin: os clientes de cada representante, com a tabela de preço de cada um. */
@Component({
  selector: 'app-clientes-admin',
  imports: [RouterLink, AbasAdminComponent, ErroCarregamentoComponent, EsqueletoListaComponent, FormularioClienteComponent],
  providers: [ClientesAdminStore, TabelasAdminStore, UsuariosStore],
  templateUrl: './clientes-admin.component.html',
})
export class ClientesAdminComponent {
  private readonly store = inject(ClientesAdminStore);
  private readonly usuarios = inject(UsuariosStore);
  private readonly tabelasStore = inject(TabelasAdminStore);

  readonly representantes = this.usuarios.usuarios;
  readonly tabelas = this.tabelasStore.tabelas;
  readonly representanteId = this.store.representanteId;
  readonly carregando = this.store.carregando;
  readonly erro = this.store.erro;

  readonly busca = signal('');
  readonly clientes = computed(() =>
    filtrarPorTexto(this.store.clientes(), this.busca(), c => `${c.nome} ${c.codigo ?? ''} ${c.cidade}`),
  );

  readonly novoCliente = linkedSignal<number | null, DadosCliente>({
    source: this.representanteId,
    computation: id => clienteVazio(id),
  });
  readonly criando = signal(false);
  readonly erroAoCriar = signal('');

  readonly editando = signal<ClienteDoRepresentante | null>(null);
  // computed, e não uma função no template: um objeto novo a cada verificação reiniciaria o formulário.
  readonly dadosEdicao = computed(() => {
    const cliente = this.editando();
    if (!cliente) return null;
    const { representanteId, nome, cidade, uf, codigoTabela } = cliente;
    return { representanteId, nome, cidade, uf, codigoTabela };
  });
  readonly salvandoEdicao = signal(false);
  readonly erroEdicao = signal('');

  readonly inativando = signal<ClienteDoRepresentante | null>(null);
  readonly erroAtivo = signal('');
  readonly aviso = signal('');

  constructor() {
    // Abre já no primeiro representante com clientes, para a tela não começar vazia.
    effect(() => {
      if (this.representanteId() === null) {
        const primeiro = this.representantes().find(representante => representante.clientes > 0);
        if (primeiro) this.representanteId.set(primeiro.id);
      }
    });
  }

  escolherRepresentante(evento: Event): void {
    this.representanteId.set(Number((evento.target as HTMLSelectElement).value) || null);
    this.editando.set(null);
    this.inativando.set(null);
    this.aviso.set('');
  }

  async criar(dados: DadosCliente): Promise<void> {
    this.criando.set(true);
    this.erroAoCriar.set('');
    try {
      const cliente = await this.store.criar(dados);
      this.aviso.set(`${cliente.nome} cadastrado.`);
      this.atualizarContagens();
      this.novoCliente.set(clienteVazio(this.representanteId()));
    } catch (erro) {
      this.erroAoCriar.set(motivoDoErro(erro, 'Não foi possível cadastrar o cliente. Tente de novo.'));
    } finally {
      this.criando.set(false);
    }
  }

  abrirEdicao(cliente: ClienteDoRepresentante): void {
    this.inativando.set(null);
    this.erroEdicao.set('');
    this.aviso.set('');
    this.editando.set(this.editando()?.id === cliente.id ? null : cliente);
  }

  async salvarEdicao(dados: DadosCliente): Promise<void> {
    const cliente = this.editando();
    if (!cliente) return;
    this.salvandoEdicao.set(true);
    this.erroEdicao.set('');
    try {
      const alterado = await this.store.editar(cliente.id, dados);
      const outroRepresentante = alterado.representanteId !== this.representanteId();
      this.aviso.set(outroRepresentante ? `${alterado.nome} passou para outro representante.` : `${alterado.nome} atualizado.`);
      this.editando.set(null);
      this.atualizarContagens();
    } catch (erro) {
      this.erroEdicao.set(motivoDoErro(erro, 'Não foi possível salvar o cliente. Tente de novo.'));
    } finally {
      this.salvandoEdicao.set(false);
    }
  }

  pedirInativacao(cliente: ClienteDoRepresentante): void {
    this.editando.set(null);
    this.erroAtivo.set('');
    this.inativando.set(cliente);
  }

  async alterarAtivo(cliente: ClienteDoRepresentante, ativo: boolean): Promise<void> {
    this.erroAtivo.set('');
    this.aviso.set('');
    try {
      await this.store.alterarAtivo(cliente.id, ativo);
      this.aviso.set(ativo ? `${cliente.nome} reativado.` : `${cliente.nome} inativado.`);
      this.inativando.set(null);
      this.atualizarContagens();
    } catch (erro) {
      this.erroAtivo.set(motivoDoErro(erro, 'Não foi possível mudar o cliente. Tente de novo.'));
    }
  }

  recarregar(): void {
    this.store.recarregar();
  }

  // O número de clientes ao lado de cada representante vem da API (só os ativos).
  private atualizarContagens(): void {
    this.usuarios.recarregar();
  }
}

function clienteVazio(representanteId: number | null): DadosCliente {
  return { representanteId: representanteId ?? 0, nome: '', cidade: '', uf: '', codigoTabela: '' };
}
