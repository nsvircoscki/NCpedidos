import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PRE_CADASTROS } from '../../data/pre-cadastros';

type ReviewStatus = 'waiting' | 'approved' | 'rejected';

interface ClientField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-analise-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './analise-cliente.component.html'
})
export class AnaliseClientePageComponent {

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly cadastro = PRE_CADASTROS.find(item => item.id === this.id) ?? PRE_CADASTROS[0];

  status: ReviewStatus = 'waiting';
  notes = '';
  internalNote = '';

  readonly clientFields: ClientField[] = [
    { label: 'Razão social', value: this.cadastro.nome },
    { label: 'Nome fantasia', value: 'Nome exemplo 1' },
    { label: 'Documento', value: this.cadastro.documento },
    { label: 'Segmento', value: 'Segmento exemplo' },
    { label: 'Responsável', value: 'Nome exemplo' },
    { label: 'Telefone', value: '(11) 98742-5521' },
    { label: 'E-mail', value: 'email@exemplo.com.br' },
    { label: 'Localização', value: `${this.cadastro.cidade} - ${this.cadastro.uf}` }
  ];


  statusLabel(): string {
    switch (this.status) {
      case 'approved':
        return 'Cliente aprovado';
      case 'rejected':
        return 'Pré-cadastro recusado';
      default:
        return 'Aguardando análise';
    }
  }

  setStatus(status: ReviewStatus): void {
    this.status = status;
  }
}
