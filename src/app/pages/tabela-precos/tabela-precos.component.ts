import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { SidebarService } from '../../services/sidebar';
import { ItemTabelaPreco } from '../../models/tabela-preco.model';

@Component({
  selector: 'app-tabela-precos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopHeaderComponent, MobileNavigationComponent],
  templateUrl: './tabela-precos.component.html'
})
export class TabelaPrecosPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);

  sidebarMinimizada = false;
  clienteId = Number(this.route.snapshot.paramMap.get('id'));
  clienteNome = this.obterNomeCliente(this.clienteId);
  itens: ItemTabelaPreco[] = [];
  termoBusca = '';
  categoriasSelecionadas: string[] = [];
  statusSelecionados: string[] = [];
  coresSelecionadas: string[] = [];
  paginaAtual = 1;
  itensPorPagina = 10;
  itensSelecionados = new Set<number>();

  constructor() {
    this.sidebarService.minimizada$.subscribe((estado) => {
      this.sidebarMinimizada = estado;
    });
    this.itens = this.obterTabelaDoCliente(this.clienteId);
  }

  voltar(): void {
    this.router.navigate(['/clientes']);
  }

  get categorias(): string[] {
    return [...new Set(this.itens.map(item => item.categoria))];
  }

  get status(): string[] {
    return [...new Set(this.itens.map(item => item.status))];
  }

  get cores(): string[] {
    return [...new Set(this.itens.map(item => item.cor))];
  }

  get itensFiltrados(): ItemTabelaPreco[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.itens.filter(item =>
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

  limparFiltros(): void {
    this.termoBusca = '';
    this.categoriasSelecionadas = [];
    this.statusSelecionados = [];
    this.coresSelecionadas = [];
    this.paginaAtual = 1;
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

  private obterNomeCliente(id: number): string {
    const clientes: Record<number, string> = {
      1: 'Casa Almeida Materiais',
      2: 'João da Silva',
      3: 'Constrular Materiais'
    };

    return clientes[id] ?? 'Cliente';
  }

  private obterTabelaDoCliente(id: number): ItemTabelaPreco[] {
    const tabelas: Record<number, ItemTabelaPreco[]> = {
      1: [
        { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 269.90 },
        { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 109.90 },
        { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 69.50 }
      ],
      2: [
        { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 289.90 },
        { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 119.90 },
        { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 74.50 }
      ],
      3: [
        { id: 1, produto: 'Tinta Acrílica Premium 18L', codigoSKU: 'TIN-001', categoria: 'Paredes', embalagem: '18 L', estoque: 124, precoBase: 289.90, status: 'ATIVO', cor: 'Branco Neve', preco: 254.90 },
        { id: 2, produto: 'Esmalte Sintético Brilhante 3,6L', codigoSKU: 'TIN-002', categoria: 'Esmaltes', embalagem: '3,6 L', estoque: 86, precoBase: 119.90, status: 'ATIVO', cor: 'Branco', preco: 99.90 },
        { id: 3, produto: 'Massa Corrida 25kg', codigoSKU: 'TIN-003', categoria: 'Preparação', embalagem: '25 kg', estoque: 42, precoBase: 89.90, status: 'INATIVO', cor: 'Branco', preco: 64.50 }
      ]
    };

    return (tabelas[id] ?? []).map((item) => ({ ...item }));
  }
}
