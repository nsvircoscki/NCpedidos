import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../models/produto.model';
import { FormsModule } from '@angular/forms';

type TipoDropdown = 'categoria' | 'status' | 'cor';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos-table.component.html',
})

export class ProdutosComponent {
  @Input() produtos: Produto[] = [];

  termoBusca = '';
  categoriaSelecionada = '';
  statusSelecionado = '';
  corSelecionada = '';

  paginaAtual = 1;
  itensPorPagina = 10;

  produtosSelecionados = new Set<number>();

  alternarSelecao(produto: Produto): void {
    if (this.produtosSelecionados.has(produto.id)) {
      this.produtosSelecionados.delete(produto.id);
    } else {
      this.produtosSelecionados.add(produto.id);
    }
  }

  produtoEstaSelecionado(produto: Produto): boolean {
    return this.produtosSelecionados.has(produto.id);
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.categoriaSelecionada = '';
    this.statusSelecionado = '';
    this.corSelecionada = '';
    this.paginaAtual = 1;
  }

  get categorias(): string[] {
    return [...new Set(this.produtos.map(produto => produto.categoria))];
}

  get status(): string[] {
    return [...new Set(this.produtos.map(produto => produto.status))];
  }

  get cores(): string[] {
    return [...new Set(this.produtos.map(produto => produto.cor))];
  }

  get possuiFiltrosAtivos(): boolean {
    return Boolean(
      this.termoBusca.trim() ||
      this.categoriaSelecionada ||
      this.statusSelecionado ||
      this.corSelecionada
    );
  }

  get produtosFiltrados(): Produto[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.produtos.filter(produto => {
      const correspondeBusca = 
        !termo || 
        produto.nome.toLowerCase().includes(termo) ||
        produto.codigoSKU.toLowerCase().includes(termo) ||
        produto.descricao.toLowerCase().includes(termo);

        const correspondeCategoria =
          !this.categoriaSelecionada ||
          produto.categoria === this.categoriaSelecionada;

        const correspondeStatus = 
          !this.statusSelecionado ||
          produto.status === this.statusSelecionado;

        const correspondeCor =
          !this.corSelecionada ||
          produto.cor === this.corSelecionada;

        return (
          correspondeBusca &&
          correspondeCategoria &&
          correspondeStatus &&
          correspondeCor
        );
    });
  }

  get produtosDaPagina(): Produto[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.produtosFiltrados.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.produtosFiltrados.length / this.itensPorPagina)
    );
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }
    this.paginaAtual = pagina;
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  paginaAnterior():void {
    this.irParaPagina(this.paginaAtual -1);
  }

  dropdownAberto: TipoDropdown | null = null;

  alternarDropdown(tipo: TipoDropdown): void {
    this.dropdownAberto =
      this.dropdownAberto === tipo ? null : tipo;
  }

  selecionarFiltro(
    tipo: TipoDropdown,
    valor: string
  ): void {
    if (tipo === 'categoria') {
      this.categoriaSelecionada = valor;
    }

    if (tipo === 'status') {
      this.statusSelecionado = valor;
    }

    if (tipo === 'cor') {
      this.corSelecionada = valor;
    }

    this.paginaAtual = 1;
    this.dropdownAberto = null;
  }

  valorSelecionado(tipo: TipoDropdown): string {
    if (tipo === 'categoria') {
      return this.categoriaSelecionada || 'Todas as categorias';
    }

    if (tipo === 'status') {
      return this.statusSelecionado || 'Todos os status';
    }

    return this.corSelecionada || 'Todas as cores';
  }

  textoStatus(statusProduto: string): string {
    if (statusProduto === 'ATIVO') {
      return 'Ativo';
    }

    if (statusProduto === 'INATIVO') {
      return 'Inativo';
    }

    return statusProduto;
  }
}
