import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FormField, form, maxLength, required, validate } from '@angular/forms/signals';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';
import { Router, RouterModule } from '@angular/router';
import { ClienteSelecao } from '../../models/cliente.model';
import { SeletorClienteComponent } from '../../components/seletor-cliente/seletor-cliente.component';
import { ClientesStore } from '../../services/clientes-store';
import { PedidoDetalhado } from '../../models/pedido.model';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';
import { ProdutoService } from '../../services/produto';
import { SessaoService } from '../../services/sessao';

type PaymentOption = 'À vista' | '28 dias' | '28/56 dias';

interface ProductOption {
  id: number;
  name: string;
  description: string;
  unit: string;
  price: number;
  color: string;
}

@Component({
  selector: 'app-cadastro-pedido',
  standalone: true,
  imports: [CommonModule, ErroCampoComponent, RouterModule, SeletorClienteComponent, FormField],
  templateUrl: './cadastro-pedido.component.html'
})
export class CadastroPedidoPageComponent {
  private readonly router = inject(Router);
  private readonly pedidosStore = inject(PedidosStore);
  private readonly produtoService = inject(ProdutoService);
  private readonly pedidoPdf = inject(PedidoPdfService);
  private readonly sessao = inject(SessaoService);

  readonly products = computed<ProductOption[]>(() => {
  const clienteId = this.clienteSelecionado()?.id;
  if(!clienteId) {
    return [];
  }

  return this.produtoService.produtos().map(produto => ({
    id: produto.id,
    name: produto.nome,
    description: produto.descricao,
    unit: produto.embalagem,
    price: produto.precosPorCliente?.[clienteId] ?? produto.preco,
    color: produto.cor,
  }));
});

  readonly paymentOptions: PaymentOption[] = ['À vista', '28 dias', '28/56 dias'];
  quantities: Record<number, number> = { 1: 2, 2: 1, 3: 1 };
  payment: PaymentOption = '28 dias';
  
  readonly dadosPedido = signal({
    previsaoEntrega: '', 
    observacao: '',
    confirmado: false
  });

  readonly formulario = form(this.dadosPedido, campo => {
    required(campo.confirmado, { message: 'Confirme os dados do pedido.' });
    maxLength(campo.observacao, 500, { message: 'A observação vai até 500 caracteres.' });
    validate(campo.previsaoEntrega, ({ value }) =>
      value() && value() < hojeNoFormatoDoInput()
        ? { kind: 'dataPassada', message: 'A entrega não pode ser no passado.' }
        : null);
  });

  tentouEnviar = false;
  erroAoEnviar = '';


  submitted = false;
  pedidoEnviado: PedidoDetalhado | null = null;

  readonly clientes = inject(ClientesStore).paraSelecao;
  readonly clienteSelecionado = linkedSignal<ClienteSelecao | null>(() => this.clientes()[0] ?? null);

  get itemCount(): number {
    return Object.values(this.quantities).reduce((total, quantity) => total + quantity, 0);
  }

  get subtotal(): number {
    return this.products().reduce(
      (total, product) => total + product.price * (this.quantities[product.id] ?? 0),
      0
    );
  }

  get discount(): number {
    return this.subtotal * 0.05;
  }

  get total(): number {
    return this.subtotal - this.discount;
  }

  get pendencia(): string {
    if (!this.clienteSelecionado()) return 'Escolha um cliente.';
    if (this.itemCount === 0) return 'Adicione pelo menos 1 item.';
    return '';
  }

  get avisoEnvio(): string {
    if (this.tentouEnviar && this.pendencia) return this.pendencia;
    return this.erroAoEnviar;
  }

  get previsaoFormatada(): string {
    const data = this.dadosPedido().previsaoEntrega;
    return data ? formatarData(data) : 'Informado pela empresa';
  }

  changeQuantity(productId: number, change: number): void {
    const currentQuantity = this.quantities[productId] ?? 0;
    this.quantities = {
      ...this.quantities,
      [productId]: Math.max(0, currentQuantity + change)
    };
    this.submitted = false;
  }

  selectPayment(option: PaymentOption): void {
    this.payment = option;
    this.submitted = false;
  }

  async submitOrder(evento: Event): Promise<void> {
    evento.preventDefault();
    this.tentouEnviar = true;
    this.formulario().markAsTouched();

    const cliente = this.clienteSelecionado();
    if (!cliente || this.pendencia || this.formulario().invalid()) return;

    const { previsaoEntrega, observacao } = this.dadosPedido();
    try {
      this.pedidoEnviado = await this.pedidosStore.adicionar({
        clienteId: cliente.id,
        client: cliente.nome,
        initials: cliente.nome.split(' ').slice(0, 2).map(parte => parte[0]).join('').toUpperCase(),
        avatar: 'blue',
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date()),
        status: 'Em análise',
        documentoCliente: cliente.documento,
        cidade: cliente.cidade, 
        uf: cliente.uf,
        representante: this.sessao.usuario()?.nome ?? '',
        pagamento: this.payment,
        previsaoEntrega: previsaoEntrega ? formatarData(previsaoEntrega): 'Informado pela empresa',
        observacao: observacao.trim(),
        itens: this.products()
          .filter(product => (this.quantities[product.id] ?? 0) > 0)
          .map(product => ({
            nome: product.name,
            descricao: product.description,
            unidade: product.unit,
            quantidade: this.quantities[product.id],
            precoUnitario: product.price,
          })),
        volumes: this.itemCount,
        desconto: this.discount,
        total: this.total,
      });
      this.erroAoEnviar = '';
      this.submitted = true;
    } catch {
      this.erroAoEnviar = 'Ocorreu um erro ao enviar o pedido. Tente novamente.';
    }
  }
  

  enviarPdf(): void {
    if (this.pedidoEnviado) {
      this.pedidoPdf.enviarAoCliente(this.pedidoEnviado);
    }
  }

  baixarPdf(): void {
    if (this.pedidoEnviado) {
      this.pedidoPdf.baixar(this.pedidoEnviado);
    }
  }

  fechar(): void {
    this.router.navigate(['/dashboard']);
  }
}

// en-CA formata como AAAA-MM-DD no fuso de quem usa, igual ao valor do <input type="date">.
function hojeNoFormatoDoInput(): string {
  return new Date().toLocaleDateString('en-CA');
}

function formatarData(dataDoInput: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new
Date(`${dataDoInput}T00:00`));
}
