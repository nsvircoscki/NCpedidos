import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClienteSelecao } from '../../models/cliente.model';
import { SeletorClienteComponent } from '../../components/seletor-cliente/seletor-cliente.component';
import { CLIENTES_SELECAO } from '../../data/clientes';
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
  imports: [CommonModule, FormsModule, RouterModule, NgmMotionDirective, SeletorClienteComponent],
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
    this.submitted = true;
  }

  fechar(): void {
    this.router.navigate(['/dashboard']);
  }
}
