import { SeletorClienteComponent } from '../../components/seletor-cliente/seletor-cliente.component';
import { CLIENTES_SELECAO } from '../../data/clientes';
import { ClienteSelecao } from '../../models/cliente.model';
import { FiltroModalComponent } from '../../components/filtro-modal/filtro-modal.component';
import { FiltroChipsComponent } from '../../components/filtro-modal/filtro-chips.component';
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
    selector: 'app-produtos-page',
    standalone: true,
    imports: [SeletorClienteComponent, FiltroModalComponent, FiltroChipsComponent, CommonModule, FormsModule, RouterLink, NgmMotionDirective],
    templateUrl: './produtos.component.html',
})
export class ProdutosPageComponent { 

    private produtoService = inject(ProdutoService);

    

    constructor() {
      this.produtos = this.produtoService.listar();

    }

    readonly clientes = CLIENTES_SELECAO;
    clienteSelecionado: ClienteSelecao | null = null;

    filtrosAbertos = false;

    /** Texto digitado no campo "Pesquisar filtros" (dropdown desktop e gaveta mobile). */
    buscaFiltro = '';

    get categoriasFiltradas(): string[] {
      const termo = this.normalizar(this.buscaFiltro.trim());
      if (!termo) {
        return this.categorias;
      }
      return this.categorias.filter((categoria) => this.normalizar(categoria).includes(termo));
    }

    abrirFiltros(): void {
      this.filtrosAbertos = true;
    }

    @HostListener('document:keydown.escape')
    fecharModais(): void {
      this.fecharFiltros();
    }

    fecharFiltros(): void {
      this.filtrosAbertos = false;
      this.buscaFiltro = '';
    }

    categoriaEstaSelecionada(categoria: string): boolean {
      return this.categoriasSelecionadas.includes(categoria);
    }

    /** Marca/desmarca uma categoria. Nenhuma marcada = todas as categorias. */
    alternarCategoria(categoria: string): void {
      this.categoriasSelecionadas = this.categoriaEstaSelecionada(categoria)
        ? this.categoriasSelecionadas.filter((item) => item !== categoria)
        : [...this.categoriasSelecionadas, categoria];
    }

    limparCategorias(): void {
      this.categoriasSelecionadas = [];
    }

    private normalizar(texto: string): string {
      return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }

    get totalFiltrosAtivos(): number {
      return this.categoriasSelecionadas.length +
        this.statusSelecionados.length +
        this.coresSelecionadas.length +
        (this.termoBuscaMobile.trim() ? 1 : 0);
    }

    limparFiltros(): void {
      this.categoriasSelecionadas = [];
      this.statusSelecionados = [];
      this.coresSelecionadas = [];
      this.termoBuscaMobile = '';
    }

    /** Filtros extras do desktop. Nenhum marcado = todos. */
    statusSelecionados: string[] = [];
    coresSelecionadas: string[] = [];

    get statusProdutos(): string[] {
      return [...new Set(this.produtos.map((produto) => produto.status))];
    }

    get cores(): string[] {
      return [...new Set(this.produtos.map((produto) => produto.cor))];
    }

    alternarStatus(status: string): void {
      this.statusSelecionados = this.statusSelecionados.includes(status)
        ? this.statusSelecionados.filter((item) => item !== status)
        : [...this.statusSelecionados, status];
    }

    alternarCor(cor: string): void {
      this.coresSelecionadas = this.coresSelecionadas.includes(cor)
        ? this.coresSelecionadas.filter((item) => item !== cor)
        : [...this.coresSelecionadas, cor];
    }

    textoStatus(status: string): string {
      return status === 'ATIVO' ? 'Ativo' : 'Inativo';
    }

    categoriasSelecionadas: string[] = [];

    get categorias(): string[] {
      return [...new Set(this.produtos.map((produto) => produto.categoria))];
    }

    termoBuscaMobile = '';

    precoDoProduto(produto: Produto): number {
      if (!this.clienteSelecionado) {
        return produto.preco;
      }

      return produto.precosPorCliente?.[this.clienteSelecionado.id] ?? produto.preco;
    }

    get produtosMobile(): Produto[] {
      const termo = this.termoBuscaMobile.trim().toLowerCase();

      return this.produtos.filter((produto) => {
        const combinaComBusca =
          !termo ||
          produto.nome.toLowerCase().includes(termo) ||
          produto.codigoSKU.toLowerCase().includes(termo);

        const combinaComCategoria =
          this.categoriasSelecionadas.length === 0 ||
          this.categoriasSelecionadas.includes(produto.categoria);

        const combinaComStatus =
          this.statusSelecionados.length === 0 ||
          this.statusSelecionados.includes(produto.status);

        const combinaComCor =
          this.coresSelecionadas.length === 0 ||
          this.coresSelecionadas.includes(produto.cor);

        return combinaComBusca && combinaComCategoria && combinaComStatus && combinaComCor;
      });
    }

    produtos: Produto[] = [];
}
