import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente } from '../../models/cliente.model';
import { NgmMotionDirective, useMotionValue, useVelocity, useTransform, useSpring, type MotionStyle } from '@scripttype/ng-motion';

type TipoFiltroCliente = 'tipo' | 'status' | 'cidade';
type OrdenacaoCliente = 'nome' | 'cadastro' | 'ultimaCompra' | 'totalComprado';


@Component({
  selector: 'app-clientes-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgmMotionDirective],
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

  // ---- Modal de filtros: arrastável para os lados, com efeito gelatina ----

  /** Painel do botão hambúrguer (filtros + ordenação) aberto ou fechado. */
  filtrosAbertos = false;

  /** O modal (a <section> arrastável), para medir a largura dele. */
  private readonly modalFiltros = viewChild<ElementRef<HTMLElement>>('modalFiltros');

  /** Espaço mínimo (px) entre o modal e a borda da tela. */
  private readonly margemDaTela = 16;

  /**
   * Até onde o modal pode ir para cada lado, em px a partir do centro.
   * Recalculado ao abrir e ao redimensionar a janela.
   */
  readonly limitesArrasto = signal({ left: 0, right: 0, top: 0, bottom: 0 });

  /** 1. Posição horizontal do modal (px) a partir do centro da tela. O drag escreve aqui. */
  readonly arrastoX = useMotionValue(0);

  /** 2. Velocidade do arrasto (px/s): positiva para a direita, negativa para a esquerda. */
  private readonly velocidadeX = useVelocity(this.arrastoX);

  // 3. Velocidade → deformação: gira no plano, inclina, gira em 3D como uma porta
  //    e estica na largura enquanto achata na altura.
  private readonly giroBruto = useTransform(this.velocidadeX, [-3200, 0, 3200], [-8, 0, 8]);
  private readonly inclinacaoBruta = useTransform(this.velocidadeX, [-3200, 0, 3200], [6, 0, -6]);
  private readonly giro3dBruto = useTransform(this.velocidadeX, [-3200, 0, 3200], [-20, 0, 20]);
  private readonly esticarBruto = useTransform(this.velocidadeX, [-3200, 0, 3200], [1.12, 1, 1.12]);
  private readonly achatarBruto = useTransform(this.velocidadeX, [-3200, 0, 3200], [0.92, 1, 0.92]);

  // 4. Molas (valores da demo do ng-motion)
  private readonly molaDeformacao = { stiffness: 320, damping: 16, mass: 0.34 };
  private readonly molaEsticar = { stiffness: 360, damping: 14, mass: 0.4 };

  /** Estilo ligado ao modal no HTML: posição + deformações já suavizadas. */
  readonly estiloArrasto: MotionStyle = {
    x: this.arrastoX,
    rotate: useSpring(this.giroBruto, this.molaDeformacao),
    skewY: useSpring(this.inclinacaoBruta, this.molaDeformacao),
    rotateY: useSpring(this.giro3dBruto, this.molaDeformacao),
    scaleX: useSpring(this.esticarBruto, this.molaEsticar),
    scaleY: useSpring(this.achatarBruto, this.molaEsticar),
    transformPerspective: 900,
  };

  
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

  alternarFiltros(): void {
    this.filtrosAbertos = !this.filtrosAbertos;

    if (this.filtrosAbertos) {
      this.atualizarLimitesArrasto();
    }
  }

  @HostListener('document:keydown.escape')
  fecharFiltros(): void {
    this.filtrosAbertos = false;
  }

  /**
   * Calcula até onde o modal pode ir sem sair da tela.
   * O modal começa centralizado, então o espaço livre de cada lado é
   * (largura da janela - largura do modal) / 2, menos a margem.
   */
  @HostListener('window:resize')
  atualizarLimitesArrasto(): void {
    const modal = this.modalFiltros()?.nativeElement;
    if (!modal) return;

    // offsetWidth ignora transform: mede a largura real, sem o esticar da gelatina.
    const espacoLivre = Math.max(0, (window.innerWidth - modal.offsetWidth) / 2 - this.margemDaTela);
    this.limitesArrasto.set({ left: -espacoLivre, right: espacoLivre, top: 0, bottom: 0 });

    // Se a janela encolheu e o modal ficou fora, traz de volta para dentro.
    const x = this.arrastoX.get();
    if (Math.abs(x) > espacoLivre) {
      this.arrastoX.set(Math.sign(x) * espacoLivre);
    }
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
