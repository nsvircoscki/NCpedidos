import { FiltroModalComponent } from '../../components/filtro-modal/filtro-modal.component';
import { FiltroChipsComponent } from '../../components/filtro-modal/filtro-chips.component';
import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente } from '../../models/cliente.model';

type TipoFiltroCliente = 'tipo' | 'status' | 'cidade';
type OrdenacaoCliente = 'nome' | 'cadastro' | 'ultimaCompra' | 'totalComprado';


@Component({
  selector: 'app-clientes-table',
  standalone: true,
  imports: [FiltroModalComponent, FiltroChipsComponent, CommonModule, FormsModule],
  templateUrl: './clientes-table.component.html'
})
export class ClientesTableComponent {
  private router = inject(Router);

  @Input() clientes: Cliente[] = [];

  termoBusca = '';
  tipoSelecionado = '';
  statusSelecionado = '';
  cidadeSelecionada = '';
  ordenacao: OrdenacaoCliente = 'nome';

  readonly opcoesOrdenacao: { valor: OrdenacaoCliente; texto: string} [] = [
    { valor: 'nome', texto: 'Nome'},
    { valor: 'cadastro', texto: 'Data de Cadastro'},
    { valor: 'ultimaCompra', texto: 'Última Compra'},
    { valor: 'totalComprado', texto: 'Total Comprado'}
  ];

  paginaAtual = 1;
  itensPorPagina = 10;
  menuAcoesAberto: number | null = null;
  clientesSelecionados = new Set<number>();

  get tiposCliente(): string[] {
    return [...new Set(this.clientes.map(cliente => cliente.tipo))];
  }

  get status(): string[] {
    return [...new Set(this.clientes.map(cliente => cliente.status))];
  }

  get cidades(): string[] {
    return [...new Set(this.clientes.map(cliente => cliente.cidade))];
  }

  get possuiFiltrosAtivos(): boolean {
    return Boolean(
      this.termoBusca.trim() ||
      this.tipoSelecionado ||
      this.statusSelecionado ||
      this.cidadeSelecionada
    );
  }

  get clientesFiltrados(): Cliente[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.clientes.filter(cliente => {
      const correspondeBusca =
        !termo ||
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpfcnpj.toLowerCase().includes(termo) ||
        cliente.email.toLowerCase().includes(termo);

      return (
        correspondeBusca &&
        (!this.tipoSelecionado || cliente.tipo === this.tipoSelecionado) &&
        (!this.statusSelecionado || cliente.status === this.statusSelecionado) &&
        (!this.cidadeSelecionada || cliente.cidade === this.cidadeSelecionada)
      );
    });
  }

  get clientesOrdenados(): Cliente[] {
    const lista = [...this.clientesFiltrados];

    return lista.sort((a, b) => {
      switch (this.ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });

        case 'cadastro':
          return this.paraTimestamp(b.dataCadastro) - this.paraTimestamp(a.dataCadastro);

        case 'ultimaCompra':
          return this.paraTimestamp(b.ultimaCompra) - this.paraTimestamp(a.ultimaCompra);

        case 'totalComprado':
          return b.totalComprado - a.totalComprado;
      }
    });
  }

  private paraTimestamp(data: string | Date | undefined): number {
    if (!data) return 0;
    const tempo = new Date(data).getTime();
    return Number.isNaN(tempo) ? 0:  tempo;
  }

  
  get clientesDaPagina(): Cliente[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clientesOrdenados.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.clientesFiltrados.length / this.itensPorPagina)
    );
  }

  /** Quantos filtros do painel estão ativos (número no canto do botão hambúrguer). */
  get totalFiltrosAtivos(): number {
    return [this.tipoSelecionado, this.statusSelecionado, this.cidadeSelecionada]
      .filter(Boolean).length;
  }

  /**
   * Marca um filtro. Clicar de novo no valor já marcado desmarca (volta para "todos").
   * O painel continua aberto para a pessoa combinar vários filtros.
   */
  selecionarFiltro(tipo: TipoFiltroCliente, valor: string): void {
    const novoValor = this.valorSelecionado(tipo) === valor ? '' : valor;

    if (tipo === 'tipo') {
      this.tipoSelecionado = novoValor;
    } else if (tipo === 'status') {
      this.statusSelecionado = novoValor;
    } else {
      this.cidadeSelecionada = novoValor;
    }

    this.paginaAtual = 1;
  }

  selecionarOrdenacao(valor: OrdenacaoCliente): void {
    this.ordenacao = valor;
    this.paginaAtual = 1;
  }

  /** Limpa só os filtros do painel; a busca e a ordenação continuam. */
  limparFiltrosDoPainel(): void {
    this.tipoSelecionado = '';
    this.statusSelecionado = '';
    this.cidadeSelecionada = '';
    this.paginaAtual = 1;
  }

  valorSelecionado(tipo: TipoFiltroCliente): string {
    if (tipo === 'tipo') {
      return this.tipoSelecionado;
    }

    if (tipo === 'status') {
      return this.statusSelecionado;
    }

    return this.cidadeSelecionada;
  }

  textoStatus(statusCliente: string): string {
    if (statusCliente === 'ATIVO') {
      return 'Ativo';
    }

    if (statusCliente === 'INATIVO') {
      return 'Inativo';
    }

    return statusCliente;
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.tipoSelecionado = '';
    this.statusSelecionado = '';
    this.cidadeSelecionada = '';
    this.paginaAtual = 1;
  }

  selecionarCliente(cliente: Cliente): void {
    if (this.clientesSelecionados.has(cliente.id)) {
      this.clientesSelecionados.delete(cliente.id);
    } else {
      this.clientesSelecionados.add(cliente.id);
    }
  }

  alternarMenuAcoes(cliente: Cliente): void {
    this.menuAcoesAberto = this.menuAcoesAberto === cliente.id ? null : cliente.id;
  }

  editarCliente(cliente: Cliente): void {
    this.menuAcoesAberto = null;
    this.router.navigate(['/clientes', cliente.id]);
  }

  verTabelaDePrecos(cliente: Cliente): void {
    this.menuAcoesAberto = null;
    this.router.navigate(['/clientes', cliente.id, 'tabela-precos']);
  }

  verPedidos(cliente: Cliente): void {
    this.menuAcoesAberto = null;
    this.router.navigate(['/pedidos'], { queryParams: { clienteId: cliente.id } });
  }

  clienteEstaSelecionado(cliente: Cliente): boolean {
    return this.clientesSelecionados.has(cliente.id);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  obterIniciais(nome: string): string {
    if (!nome) {
      return '';
    }

    const partes = nome.trim().split(/\s+/);

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
}
