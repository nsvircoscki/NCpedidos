import { Component, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { FormField, form, maxLength, pattern, required } from '@angular/forms/signals';
import { DadosCliente, TabelaDoErp } from '../../models/pedido-rapido.model';
import { UsuarioCadastrado } from '../../models/usuario.model';
import { ErroCampoComponent } from '../erro-campo/erro-campo.component';

/** Formulário do cliente na tela Clientes (admin): o mesmo para cadastrar e para editar. */
@Component({
  selector: 'app-formulario-cliente',
  imports: [FormField, ErroCampoComponent],
  templateUrl: './formulario-cliente.component.html',
})
export class FormularioClienteComponent {
  readonly inicial = input.required<DadosCliente>();
  readonly representantes = input.required<UsuarioCadastrado[]>();
  readonly tabelas = input.required<TabelaDoErp[]>();
  /** Prefixo dos ids dos campos: a tela tem o formulário de cadastro e o de edição ao mesmo tempo. */
  readonly prefixo = input.required<string>();
  readonly salvando = input(false);
  readonly erro = input('');
  readonly textoSalvar = input('Salvar');
  readonly podeCancelar = input(false);
  readonly salvar = output<DadosCliente>();
  readonly cancelar = output();

  // O <select> trabalha com texto: o id do representante vira número só ao salvar.
  readonly dados = linkedSignal(() => ({ ...this.inicial(), representanteId: String(this.inicial().representanteId || '') }));
  readonly formulario = form(this.dados, campo => {
    required(campo.nome, { message: 'Informe o nome.' });
    maxLength(campo.nome, 120, { message: 'Use no máximo 120 caracteres.' });
    maxLength(campo.cidade, 80, { message: 'Use no máximo 80 caracteres.' });
    pattern(campo.uf, /^([A-Za-z]{2})?$/, { message: 'Use a sigla com 2 letras.' });
    required(campo.representanteId, { message: 'Escolha o representante.' });
    required(campo.codigoTabela, { message: 'Escolha a tabela de preço.' });
  });

  constructor() {
    // Dados novos (outro cliente, ou o cadastro limpo depois de criar): os erros do anterior somem.
    effect(() => {
      this.inicial();
      untracked(() => this.formulario().reset());
    });
  }

  enviar(evento: Event): void {
    evento.preventDefault();
    this.formulario().markAsTouched();
    if (this.formulario().invalid()) return;
    const { nome, cidade, uf, representanteId, codigoTabela } = this.dados();
    this.salvar.emit({
      representanteId: Number(representanteId), codigoTabela,
      nome: nome.trim(), cidade: cidade.trim(), uf: uf.trim().toUpperCase(),
    });
  }
}
