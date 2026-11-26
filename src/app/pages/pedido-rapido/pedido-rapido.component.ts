import { DOCUMENT, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { SeletorClienteComponent, TextosSeletor } from '../../components/seletor-cliente/seletor-cliente.component';
import { ClienteSelecao } from '../../models/cliente.model';
import { PedidoRapido, ProdutoDaTabela } from '../../models/pedido-rapido.model';
import { ClientesRepresentanteStore } from '../../services/clientes-representante';
import { PedidoRapidoPdfService } from '../../services/pedido-rapido-pdf';
import { SessaoService } from '../../services/sessao';
import { lerSalvo, salvar } from '../../utils/armazenamento';
import {
  Descricoes, Quantidades, faltamDescricoes, filtrarProdutos, itensDoPedido, linhasDoPedido, novaChave, numeroDoPedido,
  totalDeUnidades,
} from '../../utils/pedido-rapido';

interface Rascunho {
  tabelaId: number | null;
  cliente: string;
  quantidades: Quantidades;
  descricoes: Descricoes;
  observacao: string;
}

/** Enviar abre o compartilhar do celular (no computador, baixa); baixar sempre salva o arquivo. */
type ModoPdf = 'enviar' | 'baixar';

const TEXTOS_TABELA: TextosSeletor = {
  titulo: 'Tabela de preço',
  escolher: 'Escolher tabela',
  alterar: 'Alterar tabela',
  vazio: 'Selecione uma tabela',
  buscar: 'Buscar nome ou código da tabela',
  exemplo: 'Ex.: ALGI ou 155',
  nenhum: 'Nenhuma tabela encontrada.',
};

@Component({
  selector: 'app-pedido-rapido',
  imports: [
    FormField, ErroCampoComponent, ErroCarregamentoComponent, EsqueletoListaComponent, SeletorClienteComponent,
    NgOptimizedImage, NgTemplateOutlet, NgmMotionDirective, RouterLink,
  ],
  providers: [ClientesRepresentanteStore],
  templateUrl: './pedido-rapido.component.html',
  host: {
    '(document:keydown.escape)': 'fecharProdutos()',
  },
})
export class PedidoRapidoComponent {
  private readonly sessao = inject(SessaoService);
  private readonly store = inject(ClientesRepresentanteStore);
  private readonly pdf = inject(PedidoRapidoPdfService);
  private readonly injector = inject(Injector);
  private readonly documento = inject(DOCUMENT);

  readonly representante = computed(() => this.sessao.usuario()?.nome ?? '');
  readonly admin = this.sessao.admin;
  private readonly chaveRascunho = `rascunho-pedido-${this.sessao.usuario()?.id}`;
  private readonly rascunho = lerSalvo<Rascunho>(this.chaveRascunho);

  readonly textosTabela = TEXTOS_TABELA;
  readonly carregandoTabelas = this.store.carregando;
  readonly erroTabelas = this.store.erro;

  // Cada planilha do ERP é a tabela de um cliente; o seletor de cliente serve para escolher a tabela.
  readonly tabelas = computed<ClienteSelecao[]>(() =>
    this.store.clientes().map(tabela => ({
      id: tabela.id, nome: tabela.nome, documento: `Código ${tabela.codigoTabela}`,
      limite: 0, bairro: '', cidade: '', uf: '',
    })),
  );
  readonly tabelaSelecionada = linkedSignal<ClienteSelecao[], ClienteSelecao | null>({
    source: this.tabelas,
    computation: (lista, anterior) =>
      lista.find(tabela => tabela.id === (anterior?.value?.id ?? this.rascunho?.tabelaId)) ?? null,
  });
  private readonly tabelaId = computed(() => this.tabelaSelecionada()?.id ?? null);
  readonly tabelaEscolhida = computed(() => this.store.clientes().find(tabela => tabela.id === this.tabelaId()));

  private readonly produtosDaTabela = this.store.produtosDoCliente(this.tabelaId);
  readonly produtos = computed(() => (this.produtosDaTabela.hasValue() ? this.produtosDaTabela.value() : []));
  readonly carregandoProdutos = this.produtosDaTabela.isLoading;
  readonly erroProdutos = this.produtosDaTabela.error;

  // Trocou de tabela, os produtos são outros: as quantidades zeram (menos ao voltar o rascunho salvo).
  readonly quantidades = linkedSignal<number | null, Quantidades>({
    source: this.tabelaId,
    computation: id => {
      const salvo = lerSalvo<Rascunho>(this.chaveRascunho);
      return id !== null && salvo?.tabelaId === id ? salvo.quantidades : {};
    },
  });
  readonly descricoes = linkedSignal<number | null, Descricoes>({
    source: this.tabelaId,
    computation: id => {
      const salvo = lerSalvo<Rascunho>(this.chaveRascunho);
      return id !== null && salvo?.tabelaId === id ? salvo.descricoes ?? {} : {};
    },
  });
  readonly itens = computed(() => itensDoPedido(this.produtos(), this.quantidades(), this.descricoes()));
  // Na tela aparece o nome original; a descrição digitada fica no campo próprio (e vai junto só no PDF).
  readonly linhasNoPedido = computed(() => linhasDoPedido(this.produtos(), this.quantidades()));
  private readonly faltaDescricao = computed(() => faltamDescricoes(this.produtos(), this.quantidades(), this.descricoes()));
  readonly totalUnidades = computed(() => totalDeUnidades(this.quantidades()));

  readonly modalProdutos = signal(false);
  readonly busca = signal('');
  readonly produtosVisiveis = computed(() => filtrarProdutos(this.produtos(), this.busca()));
  private readonly campoBusca = viewChild<ElementRef<HTMLInputElement>>('campoBusca');
  private readonly botaoAdicionar = viewChild<ElementRef<HTMLButtonElement>>('botaoAdicionar');

  readonly dados = signal({ cliente: this.rascunho?.cliente ?? '', observacao: this.rascunho?.observacao ?? '' });
  readonly formulario = form(this.dados, campo => {
    required(campo.cliente, { message: 'Informe o nome do cliente.' });
    maxLength(campo.cliente, 120, { message: 'Use no máximo 120 caracteres.' });
    maxLength(campo.observacao, 500, { message: 'Use no máximo 500 caracteres.' });
  });

  readonly tentouGerar = signal(false);
  readonly gerando = signal(false);
  readonly erroAoGerar = signal('');
  readonly avisoEnvio = computed(() => {
    if (this.tentouGerar() && !this.tabelaSelecionada()) return 'Escolha a tabela de preço.';
    if (this.tentouGerar() && this.itens().length === 0) return 'Informe a quantidade de pelo menos 1 produto.';
    if (this.tentouGerar() && this.faltaDescricao()) return 'Descreva o produto de desenvolvimento.';
    return this.erroAoGerar();
  });

  // Mexeu no pedido depois de gerar? O PDF antigo não vale mais e o botão de gerar volta.
  readonly pedidoGerado = linkedSignal<unknown, PedidoRapido | null>({
    source: () => [this.quantidades(), this.descricoes(), this.tabelaId(), this.dados()],
    computation: () => null,
  });

  constructor() {
    effect(() => {
      // Enquanto as tabelas carregam, a tabela ainda é null: salvar agora apagaria o rascunho.
      if (this.carregandoTabelas()) return;
      salvar(this.chaveRascunho, {
        tabelaId: this.tabelaId(),
        cliente: this.dados().cliente,
        quantidades: this.quantidades(),
        descricoes: this.descricoes(),
        observacao: this.dados().observacao,
      } satisfies Rascunho);
    });
  }

  abrirProdutos(): void {
    this.busca.set('');
    this.modalProdutos.set(true);
    // O modal fica "inert" até a tela atualizar; só depois o campo aceita o foco.
    afterNextRender(() => this.campoBusca()?.nativeElement.focus(), { injector: this.injector });
  }

  fecharProdutos(): void {
    if (!this.modalProdutos()) return;
    this.modalProdutos.set(false);
    this.botaoAdicionar()?.nativeElement.focus();
  }

  /** Cada clique cria mais uma linha de desenvolvimento e já pede a descrição dela. */
  adicionarDesenvolvimento(produto: ProdutoDaTabela): void {
    const chave = novaChave(produto.codigo, this.quantidades());
    this.quantidades.update(atuais => ({ ...atuais, [chave]: 1 }));
    this.modalProdutos.set(false);
    afterNextRender(() => this.documento.getElementById(`descricao-${chave}`)?.focus(), { injector: this.injector });
  }

  linhasDeDesenvolvimento(produto: ProdutoDaTabela): number {
    return this.linhasNoPedido().filter(linha => linha.codigo === produto.codigo).length;
  }

  quantidade(chave: string): number {
    return this.quantidades()[chave] ?? 0;
  }

  alterarQuantidade(chave: string, diferenca: number): void {
    this.definirQuantidade(chave, this.quantidade(chave) + diferenca);
  }

  digitarQuantidade(chave: string, evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const quantidade = Math.floor(Number(campo.value));
    if (quantidade >= 0) {
      this.definirQuantidade(chave, quantidade);
    } else {
      campo.value = String(this.quantidade(chave));
    }
  }

  descricao(chave: string): string {
    return this.descricoes()[chave] ?? '';
  }

  descrever(chave: string, evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value;
    this.descricoes.update(atuais => ({ ...atuais, [chave]: texto }));
  }

  async gerarPdf(evento: Event): Promise<void> {
    evento.preventDefault();
    await this.gerar('enviar');
  }

  // Depois de gerado, reenvia ou baixa o mesmo pedido (mesmo número), para não virar dois pedidos no ERP.
  async gerarOuReusar(modo: ModoPdf): Promise<void> {
    const pedido = this.pedidoGerado();
    if (pedido) await this.entregar(pedido, modo);
    else await this.gerar(modo);
  }

  private async gerar(modo: ModoPdf): Promise<void> {
    this.tentouGerar.set(true);
    this.formulario().markAsTouched();
    const tabela = this.tabelaEscolhida();
    if (!tabela || this.itens().length === 0 || this.faltaDescricao() || this.formulario().invalid()) return;

    const emitidoEm = new Date();
    const pedido: PedidoRapido = {
      numero: numeroDoPedido(emitidoEm),
      emitidoEm,
      representante: this.representante(),
      cliente: this.dados().cliente.trim(),
      tabela,
      observacao: this.dados().observacao.trim(),
      itens: this.itens(),
    };
    if (await this.entregar(pedido, modo)) {
      this.pedidoGerado.set(pedido);
    }
  }

  novoPedido(): void {
    this.tabelaSelecionada.set(null);
    this.quantidades.set({});
    this.descricoes.set({});
    this.dados.set({ cliente: '', observacao: '' });
    this.formulario().reset();
    this.busca.set('');
    this.tentouGerar.set(false);
  }

  recarregarTabelas(): void {
    this.store.recarregar();
  }

  recarregarProdutos(): void {
    this.produtosDaTabela.reload();
  }

  sair(): void {
    this.sessao.sair();
  }

  // Zerou a linha: sai do pedido, e a descrição (se for de desenvolvimento) vai junto.
  private definirQuantidade(chave: string, quantidade: number): void {
    this.quantidades.update(atuais => {
      const { [chave]: _anterior, ...outras } = atuais;
      return quantidade > 0 ? { ...outras, [chave]: quantidade } : outras;
    });
    if (quantidade === 0) {
      this.descricoes.update(({ [chave]: _apagada, ...outras }) => outras);
    }
  }

  private async entregar(pedido: PedidoRapido, modo: ModoPdf): Promise<boolean> {
    this.gerando.set(true);
    this.erroAoGerar.set('');
    try {
      await (modo === 'baixar' ? this.pdf.baixar(pedido) : this.pdf.enviar(pedido));
      return true;
    } catch {
      this.erroAoGerar.set('Não foi possível gerar o PDF. Tente de novo.');
      return false;
    } finally {
      this.gerando.set(false);
    }
  }
}
