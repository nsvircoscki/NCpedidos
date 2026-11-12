import { AmostraTintaComponent } from '../../components/amostra-tinta/amostra-tinta.component';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRE_CADASTROS } from '../../data/pre-cadastros';
import { PreCadastro, StatusPreCadastro } from '../../models/cliente.model';

type FiltroStatus = StatusPreCadastro | 'Todos';

@Component({
  selector: 'app-analise-clientes',
  imports: [RouterLink, AmostraTintaComponent],
  templateUrl: './analise-clientes.component.html',
})
export class AnaliseClientesPageComponent {
  readonly preCadastros = signal<PreCadastro[]>(PRE_CADASTROS);
  readonly filtro = signal<FiltroStatus>('Todos');

  readonly filtros: FiltroStatus[] = ['Todos', 'Aguardando análise', 'Em revisão', 'Documentação pendente'];

  readonly listaFiltrada = computed(() => {
    const filtro = this.filtro();
    const lista = this.preCadastros();
    return filtro === 'Todos' ? lista : lista.filter(cadastro => cadastro.status === filtro);
  });

  readonly aguardando = computed(() => this.contarPorStatus('Aguardando análise'));
  readonly emRevisao = computed(() => this.contarPorStatus('Em revisão'));
  readonly prioritarios = computed(() => this.preCadastros().filter(cadastro => cadastro.prioridade).length);

  private readonly coresStatus: Record<StatusPreCadastro, string> = {
    'Aguardando análise': 'bg-[#fff4dc] text-[#8A5A08] dark:bg-[#40381c] dark:text-[#edc682]',
    'Em revisão': 'bg-[#eaf2fb] text-[#1d4f8a] dark:bg-[#172f45] dark:text-noite-marca',
    'Documentação pendente': 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  };

  corDoStatus(status: StatusPreCadastro): string {
    return this.coresStatus[status];
  }

  iniciais(nome: string): string {
    return nome.split(' ').filter(parte => /\p{L}/u.test(parte)).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
  }

  exportarLista(): void {
    const cabecalho = ['Código', 'Cliente', 'Documento', 'Representante', 'Cidade', 'UF', 'Enviado', 'Status', 'Prioridade'];
    const linhas = this.listaFiltrada().map(c => [
      c.id, c.nome, c.documento, c.representante, c.cidade, c.uf, c.enviadoEm, c.status, c.prioridade ? 'Sim' : 'Não',
    ]);
    // Ponto e vírgula porque é o separador que o Excel em português espera.
    const csv = [cabecalho, ...linhas].map(linha => linha.map(valor => `"${valor}"`).join(';')).join('\n');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'analise-de-clientes.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private contarPorStatus(status: StatusPreCadastro): number {
    return this.preCadastros().filter(cadastro => cadastro.status === status).length;
  }
}
