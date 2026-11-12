import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteOption } from '../../models/cliente.model';
import { NgmMotionDirective } from '@scripttype/ng-motion';

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
  imports: [CommonModule, FormsModule, RouterModule, NgmMotionDirective],
  templateUrl: './cadastro-pedido.component.html'
})
export class CadastroPedidoPageComponent {
  private readonly router = inject(Router);

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

  // ---- Seletor de cliente ----
  readonly clientes: ClienteOption[] = [
    { id: 1, nome: 'Casa Almeida Materiais', documento: 'CNPJ 12.345.678/0001-90', limite: 8450 },
    { id: 2, nome: 'João da Silva', documento: 'CPF 123.456.789-00', limite: 2000 },
    { id: 3, nome: 'Constrular Materiais', documento: 'CNPJ 98.765.432/0001-10', limite: 15000 },
  ];

  clienteSelecionado: ClienteOption = this.clientes[0]; // começa com o primeiro
  modalClienteAberto = false;                            // o modal começa fechado
  buscaCliente = '';                                     // texto digitado na busca do modal

  abrirModalCliente(): void {
    this.buscaCliente = '';
    this.modalClienteAberto = true;
  }

  @HostListener('document:keydown.escape')
  fecharModalCliente(): void {
    this.modalClienteAberto = false;
  }

  selecionarCliente(cliente: ClienteOption): void {
    this.clienteSelecionado = cliente;
    this.fecharModalCliente();
  }

  // Lista filtrada pela busca; o "get" é recalculado sempre que a tela atualiza
  get clientesFiltrados(): ClienteOption[] {
    const termo = this.buscaCliente.trim().toLowerCase();
    return this.clientes.filter(c =>
      !termo ||
      c.nome.toLowerCase().includes(termo) ||
      c.documento.toLowerCase().includes(termo)
    );
  }

  // "Casa Almeida Materiais" -> "CA"
  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }


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
    this.submitted = true;
  }

  fechar(): void {
    this.router.navigate(['/dashboard']);
  }
}
