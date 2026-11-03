import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { SidebarService } from '../../services/sidebar';

type ReviewStatus = 'waiting' | 'approved' | 'rejected';

interface ClientField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-analise-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, TopHeaderComponent],
  templateUrl: './analise-cliente.component.html'
})
export class AnaliseClientePageComponent {
  private readonly sidebarService = inject(SidebarService);

  sidebarMinimizada = false;
  status: ReviewStatus = 'waiting';
  notes = '';
  internalNote = '';

  readonly clientFields: ClientField[] = [
    { label: 'Razão social', value: 'Empresa exemplo 1' },
    { label: 'Nome fantasia', value: 'Nome exemplo 1' },
    { label: 'CNPJ', value: '29.604.118/0001-41' },
    { label: 'Segmento', value: 'Segmento exemplo' },
    { label: 'Responsável', value: 'Nome exemplo' },
    { label: 'Telefone', value: '(11) 98742-5521' },
    { label: 'E-mail', value: 'email@exemplo.com.br' },
    { label: 'Localização', value: 'Exemplo - Ex' }
  ];

  constructor() {
    this.sidebarService.minimizada$.subscribe((estado) => {
      this.sidebarMinimizada = estado;
    });
  }

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
