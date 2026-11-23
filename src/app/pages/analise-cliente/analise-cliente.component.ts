import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { CommonModule } from '@angular/common';
import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PreCadastrosStore } from '../../services/pre-cadastros-store';

type ReviewStatus = 'waiting' | 'approved' | 'rejected';

interface ClientField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-analise-cliente',
  standalone: true,
  imports: [EsqueletoListaComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './analise-cliente.component.html'
})
export class AnaliseClientePageComponent {

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  private readonly store = inject(PreCadastrosStore);
  readonly carregando = this.store.carregando;
  readonly cadastro = computed(() => this.store.buscar(this.id) ?? this.store.preCadastros()[0]);

  readonly status = computed<ReviewStatus>(() => {
    const atual = this.cadastro()?.status;
    if (atual === 'Aprovado') return 'approved';
    if (atual === 'Rejeitado') return 'rejected';
    return 'waiting';
  });

  notes = '';
  readonly motivo = signal('');
  readonly faltaMotivo = signal(false);


  readonly clientFields = computed<ClientField[]>(() => {
    const cadastro = this.cadastro();
    if (!cadastro) return [];
    return [
      { label: 'Razão social', value: cadastro.nome },
      { label: 'Nome fantasia', value: 'Nome exemplo 1' },
      { label: 'Documento', value: cadastro.documento },
      { label: 'Segmento', value: 'Segmento exemplo' },
      { label: 'Responsável', value: 'Nome exemplo' },
      { label: 'Telefone', value: '(11) 98742-5521' },
      { label: 'E-mail', value: 'email@exemplo.com.br' },
      { label: 'Localização', value: `${cadastro.cidade} - ${cadastro.uf}` },
    ];
  });

  readonly erroAoSalvar = signal('');

  statusLabel(): string {
    switch (this.status()) {
      case 'approved':
        return 'Cliente aprovado';
      case 'rejected':
        return 'Pré-cadastro recusado';
      default:
        return 'Aguardando análise';
    }
  }

  async aprovar(): Promise<void> {
    await this.tentar(() => this.store.aprovar(this.id));
  }

  async recusar(): Promise<void> {
    const motivo = this.motivo().trim();
    this.faltaMotivo.set(!motivo);
    if (!motivo) return;
    await this.tentar(() => this.store.recusar(this.id, motivo));
  }

  private async tentar(acao: () => Promise<void>): Promise<void> {
    try {
      await acao();
      this.erroAoSalvar.set('');
    } catch {
      this.erroAoSalvar.set('Ocorreu um erro ao salvar. Tente novamente.');
    }
  }
}
