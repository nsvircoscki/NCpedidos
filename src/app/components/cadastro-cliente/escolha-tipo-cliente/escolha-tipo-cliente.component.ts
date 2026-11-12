import { Component, output } from '@angular/core';
import { TipoCadastro } from '../../../models/cliente.model';

/** Pergunta PJ ou PF antes do formulário. */
@Component({
  selector: 'app-escolha-tipo-cliente',
  templateUrl: './escolha-tipo-cliente.component.html',
})
export class EscolhaTipoClienteComponent {
  readonly escolher = output<TipoCadastro>();

  readonly opcoes: { tipo: TipoCadastro; titulo: string; descricao: string }[] = [
    { tipo: 'PJ', titulo: 'Pessoa jurídica', descricao: 'Empresa com CNPJ: lojas, construtoras, revendas.' },
    { tipo: 'PF', titulo: 'Pessoa física', descricao: 'Profissional com CPF: pintores, autônomos.' },
  ];
}
