import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente } from '../../models/cliente.model';

type TipoDropdownCliente = 'tipo' | 'status' | 'cidade';

@Component({
  selector: 'app-clientes-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-table.component.html'
})
export class ClientesTableComponent {
  private router = inject(Router);

  @Input() clientes: Cliente[] = [];

  termoBusca = '';
  tipoSelecionado = '';
  statusSelecionado = '';
  cidadeSelecionada = '';

  paginaAtual = 1;
  itensPorPagina = 10;
  dropdownAberto: TipoDropdownCliente | null = null;
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

  get clientesDaPagina(): Cliente[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.clientesFiltrados.length / this.itensPorPagina)
    );
  }

  alternarDropdown(tipo: TipoDropdownCliente): void {
    this.dropdownAberto = this.dropdownAberto === tipo ? null : tipo;
  }

  selecionarFiltro(tipo: TipoDropdownCliente, valor: string): void {
    if (tipo === 'tipo') {
      this.tipoSelecionado = valor;
    } else if (tipo === 'status') {
      this.statusSelecionado = valor;
    } else {
      this.cidadeSelecionada = valor;
    }

    this.paginaAtual = 1;
    this.dropdownAberto = null;
  }

  valorSelecionado(tipo: TipoDropdownCliente): string {
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

  alternarSelecao(cliente: Cliente): void {
    if (this.clientesSelecionados.has(cliente.id)) {
      this.clientesSelecionados.delete(cliente.id);
    } else {
      this.clientesSelecionados.add(cliente.id);
    }
  }

  abrirCliente(cliente:Cliente): void { 
    this.router.navigate(['/clientes', cliente.id]);
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
