import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteSelecao } from '../../models/cliente.model';
import { SeletorClienteComponent } from '../../components/seletor-cliente/seletor-cliente.component';
import { CLIENTES_SELECAO } from '../../data/clientes';
import { PedidoDetalhado } from '../../models/pedido.model';
import { PedidosStore } from '../../services/pedidos-store';
import { PedidoPdfService } from '../../services/pedido-pdf';

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
  imports: [CommonModule, FormsModule, RouterModule, SeletorClienteComponent],
  templateUrl: './cadastro-pedido.component.html'
})
export class CadastroPedidoPageComponent {
  private readonly router = inject(Router);
  private readonly pedidosStore = inject(PedidosStore);
  private readonly pedidoPdf = inject(PedidoPdfService);

  readonly products: ProductOption[] = [
    { id: 1, name: 'Tinta Acrílica Premium', description: 'Branco Neve · Fosco', unit: '18 L', price: 289.9, color: '#e8e7df' },
    { id: 2, name: 'Esmalte Sintético', description: 'Azul Del Rey · Brilhante', unit: '3,6 L', price: 94.5, color: '#3154d8' },
    { id: 3, name: 'Massa Corrida PVA', description: 'Interior · Fácil aplicação', unit: '25 kg', price: 78.4, color: '#e3c2a2' }
  ];
  readonly paymentOptions: PaymentOption[] = ['À vista', '28 dias', '28/56 dias'];
  quantities: Record<number, number> = { 1: 2, 2: 1, 3: 1 };
  payment: PaymentOption = '28 dias';
  deliveryDate = '';
  notes = '';
  confirmed = false;
  submitted = false;
  pedidoEnviado: PedidoDetalhado | null = null;

  readonly clientes = CLIENTES_SELECAO;
  clienteSelecionado: ClienteSelecao | null = this.clientes[0];

  get itemCount(): number {
    return Object.values(this.quantities).reduce((total, quantity) => total + quantity, 0);
  }

  get subtotal(): number {
    return this.products.reduce(
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

  submitOrder(): void {
    const cliente = this.clienteSelecionado;
    if (!cliente) return;

    this.pedidoEnviado = this.pedidosStore.adicionar({
      clienteId: 0,
      client: cliente.nome,
      initials: cliente.nome.split(' ').slice(0, 2).map(parte => parte[0]).join('').toUpperCase(),
      avatar: 'blue',
      date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date()),
      status: 'Em análise',
      documentoCliente: cliente.documento,
      cidade: cliente.cidade,
      uf: cliente.uf,
      representante: 'Camila Rocha',
      pagamento: this.payment,
      previsaoEntrega: this.deliveryDate || 'Informado pela empresa',
      observacao: this.notes.trim(),
      itens: this.products
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
    this.submitted = true;
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
