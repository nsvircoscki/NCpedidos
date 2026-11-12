import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ClienteSelecao } from '../../models/cliente.model';

/** Cartão do cliente escolhido + modal para trocar. Usado no novo pedido e em produtos. */
@Component({
  selector: 'app-seletor-cliente',
  imports: [FormsModule, NgmMotionDirective],
  templateUrl: './seletor-cliente.component.html',
  host: {
    '(document:keydown.escape)': 'fechar()',
  },
})
export class SeletorClienteComponent {
  readonly clientes = input.required<ClienteSelecao[]>();
  readonly selecionado = model<ClienteSelecao | null>(null);
  readonly destaque = input('');
  readonly permiteRemover = input(false);

  readonly aberto = signal(false);
  readonly busca = signal('');

  abrir(): void {
    this.busca.set('');
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
  }

  escolher(cliente: ClienteSelecao | null): void {
    this.selecionado.set(cliente);
    this.fechar();
  }

  clientesFiltrados(): ClienteSelecao[] {
    const termo = this.normalizar(this.busca().trim());
    if (!termo) return this.clientes();

    return this.clientes().filter(cliente =>
      [cliente.nome, cliente.documento, cliente.cidade].some(texto => this.normalizar(texto).includes(termo)),
    );
  }

  localizacao(cliente: ClienteSelecao): string {
    return `${cliente.bairro}, ${cliente.cidade} - ${cliente.uf}`;
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  }

  estaSelecionado(cliente: ClienteSelecao): boolean {
    return this.selecionado()?.id === cliente.id;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
}
