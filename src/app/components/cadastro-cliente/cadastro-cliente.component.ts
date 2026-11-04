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
    this.emitirValor('cpf', event);
  }

  onInput2(event: Event): void {
    this.emitirValor('nomeCompleto', event);
  }

  onInput3(event: Event): void {
    this.emitirValor('atuacao', event);
  }

  onInput4(event: Event): void {
    this.emitirValor('nomeResponsavel', event);
  }

  onInput5(event: Event): void {
    this.emitirValor('telefone', event);
  }

  onInput6(event: Event): void {
    this.emitirValor('email', event);
  }

  onInput7(event: Event): void {
    this.emitirValor('cep', event);
  }

  onInput8(event: Event): void {
    this.emitirValor('endereco', event);
  }

  onInput9(event: Event): void {
    this.emitirValor('bairro', event);
  }

  onInput10(event: Event): void {
    this.emitirValor('cidade', event);
  }

  onInput11(event: Event): void {
    this.emitirValor('uf', event);
  }

  onPjInput1(event: Event): void {
    this.emitirValor('cnpj', event);
  }

  onPjInput2(event: Event): void {
    this.emitirValor('razaoSocial', event);
  }

  onPjInput3(event: Event): void {
    this.emitirValor('nomeFantasia', event);
  }

  onPjInput4(event: Event): void {
    this.emitirValor('segmento', event);
  }

  private emitirValor(campo: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valorAlterado.emit({ campo, valor: input.value });
  }
}