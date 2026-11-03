import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  templateUrl: './cadastro-cliente.component.html'
})
export class CadastroClienteComponent {
  @Input() cliente!: Record<string, unknown>;

  @Output() valorAlterado = new EventEmitter<{ campo: string; valor: string }>();
  @Output() proximo = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  tipoCadastro: 'PJ' | 'PF' = 'PJ';

  onPress(): void {
  }

  irParaProximaEtapa(): void {
    this.proximo.emit();
  }

  cancelarCadastro(): void {
    this.cancelar.emit();
  }

  selecionarTipo(tipo: 'PJ' | 'PF'): void {
    this.tipoCadastro = tipo;
  }

  onInput1(event: Event): void {
    this.emitirValor('cnpj', event);
  }

  onInput2(event: Event): void {
    this.emitirValor('razaoSocial', event);
  }

  onInput3(event: Event): void {
    this.emitirValor('nomeFantasia', event);
  }

  onInput4(event: Event): void {
    this.emitirValor('responsavel', event);
  }

  onInput5(event: Event): void {
    this.emitirValor('telefone', event);
  }

  onInput6(event: Event): void {
    this.emitirValor('email', event);
  }

  onInput7(event: Event): void {
    this.emitirValor('endereco', event);
  }

  private emitirValor(campo: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valorAlterado.emit({ campo, valor: input.value });
  }
}