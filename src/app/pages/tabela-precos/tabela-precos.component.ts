import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { FiltroModalComponent } from '../../components/filtro-modal/filtro-modal.component';
import { FiltroChipsComponent } from '../../components/filtro-modal/filtro-chips.component';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal, input, numberAttribute } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemTabelaPreco } from '../../models/tabela-preco.model';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ClientesStore } from '../../services/clientes-store';
import { TabelasPrecoStore } from '../../services/tabelas-preco-store';
import { number } from 'motion-dom';


@Component({
  selector: 'app-tabela-precos-page',
  standalone: true,
  imports: [EsqueletoListaComponent, ErroCarregamentoComponent, FiltroModalComponent, FiltroChipsComponent, CommonModule, FormsModule, NgmMotionDirective],
  templateUrl: './tabela-precos.component.html'
})
export class TabelaPrecosPageComponent {
  private readonly router = inject(Router);
  private readonly clientesStore = inject(ClientesStore);
  private readonly tabelasStore = inject(TabelasPrecoStore);
  readonly mensagemPreco = signal('');

  readonly clienteId =  input.required({ alias: 'id', transform: numberAttribute });
  clienteNome = computed(() => this.clientesStore.buscar(this.clienteId())?.nome ?? 'Cliente');
  readonly carregando = this.tabelasStore.carregando;
  readonly erro = this.tabelasStore.erro;

  recarregar(): void {
    this.tabelasStore.recarregar();
  }
  readonly itens = linkedSignal<ItemTabelaPreco[], ItemTabelaPreco[]>({
    source: () => this.tabelasStore.doCliente(this.clienteId()),
    computation: (novos, anterior) => novos.map(novo => {
      const editado = anterior?.value.find(item => item.id === novo.id);
      return editado ? { ...novo, preco: editado.preco } : novo;
    }),
  });
  termoBusca = '';
  categoriasSelecionadas: string[] = [];
  statusSelecionados: string[] = [];
  coresSelecionadas: string[] = [];
  categoriaMobileSelecionada = 'Todas';
  filtrosAbertos = false;
  paginaAtual = 1;
  itensPorPagina = 10;
  itensSelecionados = new Set<number>();

  voltar(): void {
    this.router.navigate(['/clientes']);
  }

  async salvarPreco(item: ItemTabelaPreco): Promise<void> {
    try {
      await this.tabelasStore.salvarPreco(this.clienteId(), item.id, item.preco);
      this.mensagemPreco.set(`Preço de ${item.produto} salvo.`);
    } catch {
      this.mensagemPreco.set('Não foi possível salvar o preço. Tente novamente.');
    }
  }

  get categorias(): string[] {
    return [...new Set(this.itens().map(item => item.categoria))];
  }

  get status(): string[] {
    return [...new Set(this.itens().map(item => item.status))];
  }

  get cores(): string[] {
    return [...new Set(this.itens().map(item => item.cor))];
  }

  get categoriasMobile(): string[] {
    return ['Todas', ...this.categorias];
  }

  get itensFiltrados(): ItemTabelaPreco[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.itens().filter(item =>
      (!termo || item.produto.toLowerCase().includes(termo) || item.codigoSKU.toLowerCase().includes(termo)) &&
      (!this.categoriasSelecionadas.length || this.categoriasSelecionadas.includes(item.categoria)) &&
      (!this.statusSelecionados.length || this.statusSelecionados.includes(item.status)) &&
      (!this.coresSelecionadas.length || this.coresSelecionadas.includes(item.cor))
    );
  }

  get itensDaPagina(): ItemTabelaPreco[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.itensFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.itensFiltrados.length / this.itensPorPagina));
  }

  get possuiFiltrosAtivos(): boolean {
    return Boolean(
      this.termoBusca.trim() ||
      this.categoriasSelecionadas.length ||
      this.statusSelecionados.length ||
      this.coresSelecionadas.length
    );
  }

  get totalFiltrosAtivos(): number {
    return (this.termoBusca.trim() ? 1 : 0) +
      (this.categoriasSelecionadas.length ? 1 : 0) +
      (this.statusSelecionados.length ? 1 : 0) +
      (this.coresSelecionadas.length ? 1 : 0);
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.categoriasSelecionadas = [];
    this.statusSelecionados = [];
    this.coresSelecionadas = [];
    this.categoriaMobileSelecionada = 'Todas';
    this.paginaAtual = 1;
  }

  selecionarCategoriaMobile(categoria: string): void {
    this.categoriaMobileSelecionada = categoria;
    this.categoriasSelecionadas = categoria === 'Todas' ? [] : [categoria];
    this.paginaAtual = 1;
  }

  limparFiltrosMobile(): void {
    this.limparFiltros();
  }

  alternarFiltro(tipo: 'categoria' | 'status' | 'cor', valor: string): void {
    const selecionados = tipo === 'categoria'
      ? this.categoriasSelecionadas
      : tipo === 'status'
        ? this.statusSelecionados
        : this.coresSelecionadas;
    const indice = selecionados.indexOf(valor);

    if (indice === -1) selecionados.push(valor);
    else selecionados.splice(indice, 1);

    this.paginaAtual = 1;
  }

  filtroEstaSelecionado(tipo: 'categoria' | 'status' | 'cor', valor: string): boolean {
    const selecionados = tipo === 'categoria'
      ? this.categoriasSelecionadas
      : tipo === 'status'
        ? this.statusSelecionados
        : this.coresSelecionadas;

    return selecionados.includes(valor);
  }

  alternarSelecao(item: ItemTabelaPreco): void {
    if (this.itensSelecionados.has(item.id)) this.itensSelecionados.delete(item.id);
    else this.itensSelecionados.add(item.id);
  }

  itemEstaSelecionado(item: ItemTabelaPreco): boolean {
    return this.itensSelecionados.has(item.id);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaAtual = pagina;
  }

  textoStatus(status: string): string {
    return status === 'ATIVO' ? 'Ativo' : 'Inativo';
  }
}
