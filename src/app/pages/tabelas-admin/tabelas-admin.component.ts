import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AbasAdminComponent } from '../../components/abas-admin/abas-admin.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { ProdutoDaTabela } from '../../models/pedido-rapido.model';
import { TabelasAdminStore } from '../../services/tabelas-admin-store';
import { motivoDoErro } from '../../utils/erros';
import { filtrarPorTexto } from '../../utils/texto';

// São mais de 500 tabelas: a lista mostra as primeiras e a busca acha as outras.
const TABELAS_NA_LISTA = 60;

/** Tela do admin: os produtos de cada tabela de preço. A mudança vale para todos os clientes da tabela. */
@Component({
  selector: 'app-tabelas-admin',
  imports: [RouterLink, AbasAdminComponent, ErroCarregamentoComponent, EsqueletoListaComponent],
  providers: [TabelasAdminStore],
  templateUrl: './tabelas-admin.component.html',
})
export class TabelasAdminComponent {
  private readonly store = inject(TabelasAdminStore);

  readonly carregando = this.store.carregando;
  readonly erro = this.store.erro;
  readonly busca = signal('');
  private readonly encontradas = computed(() =>
    filtrarPorTexto(this.store.tabelas(), this.busca(), tabela => `${tabela.nome} ${tabela.codigo}`),
  );
  readonly tabelas = computed(() => this.encontradas().slice(0, TABELAS_NA_LISTA));
  readonly escondidas = computed(() => this.encontradas().length - this.tabelas().length);

  readonly codigo = signal<string | null>(null);
  readonly tabela = computed(() => this.store.tabelas().find(tabela => tabela.codigo === this.codigo()));
  private readonly itensSalvos = this.store.itensDaTabela(this.codigo);
  readonly carregandoItens = this.itensSalvos.isLoading;
  readonly erroItens = this.itensSalvos.error;
  // Cópia que o admin edita; só vai para a API no "Salvar".
  readonly itens = linkedSignal(() => (this.itensSalvos.hasValue() ? this.itensSalvos.value() : []));
  readonly alterada = computed(() => {
    const salvos = this.itensSalvos.hasValue() ? this.itensSalvos.value() : [];
    return codigos(salvos) !== codigos(this.itens());
  });

  readonly buscaProduto = signal('');
  private readonly produtosEncontrados = this.store.buscarProdutos(this.buscaProduto);
  readonly buscandoProdutos = this.produtosEncontrados.isLoading;
  readonly produtosParaAdicionar = computed(() => {
    const naTabela = new Set(this.itens().map(item => item.codigo));
    const encontrados = this.produtosEncontrados.hasValue() ? this.produtosEncontrados.value() : [];
    return encontrados.filter(produto => !naTabela.has(produto.codigo));
  });

  readonly salvando = signal(false);
  readonly erroAoSalvar = signal('');
  readonly aviso = signal('');

  escolher(codigo: string): void {
    this.codigo.set(codigo);
    this.buscaProduto.set('');
    this.erroAoSalvar.set('');
    this.aviso.set('');
  }

  adicionar(produto: ProdutoDaTabela): void {
    this.itens.update(itens => [...itens, produto].sort((a, b) => a.descricao.localeCompare(b.descricao)));
    this.aviso.set('');
  }

  remover(codigo: string): void {
    this.itens.update(itens => itens.filter(item => item.codigo !== codigo));
    this.aviso.set('');
  }

  desfazer(): void {
    this.itensSalvos.reload();
  }

  async salvar(): Promise<void> {
    const codigo = this.codigo();
    if (!codigo) return;
    this.salvando.set(true);
    this.erroAoSalvar.set('');
    try {
      await this.store.salvarItens(codigo, this.itens().map(item => item.codigo));
      this.itensSalvos.set(this.itens());
      this.aviso.set('Tabela salva. Os representantes já veem os produtos novos.');
    } catch (erro) {
      this.erroAoSalvar.set(motivoDoErro(erro, 'Não foi possível salvar a tabela. Tente de novo.'));
    } finally {
      this.salvando.set(false);
    }
  }

  recarregar(): void {
    this.store.recarregar();
  }
}

function codigos(itens: ProdutoDaTabela[]): string {
  return itens.map(item => item.codigo).sort().join();
}
