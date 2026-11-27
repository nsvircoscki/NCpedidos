import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClienteDoRepresentante, DadosCliente } from '../models/pedido-rapido.model';

/** Clientes de um representante, para o admin (tela Clientes). A API recusa (403) quem não é admin. */
@Injectable()
export class ClientesAdminStore {
  private readonly http = inject(HttpClient);
  readonly representanteId = signal<number | null>(null);
  private readonly recurso = httpResource<ClienteDoRepresentante[]>(() => {
    const id = this.representanteId();
    return id === null ? undefined : `/usuarios/${id}/clientes`;
  }, { defaultValue: [] });
  readonly clientes = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
  readonly carregando = this.recurso.isLoading;
  readonly erro = this.recurso.error;

  recarregar(): void {
    this.recurso.reload();
  }

  async criar(dados: DadosCliente): Promise<ClienteDoRepresentante> {
    const criado = await firstValueFrom(this.http.post<ClienteDoRepresentante>('/clientes', dados));
    this.trocarNaLista(criado);
    return criado;
  }

  async editar(id: number, dados: DadosCliente): Promise<ClienteDoRepresentante> {
    const alterado = await firstValueFrom(this.http.put<ClienteDoRepresentante>(`/clientes/${id}`, dados));
    this.trocarNaLista(alterado);
    return alterado;
  }

  async alterarAtivo(id: number, ativo: boolean): Promise<ClienteDoRepresentante> {
    const alterado = await firstValueFrom(this.http.put<ClienteDoRepresentante>(`/clientes/${id}/ativo`, { ativo }));
    this.trocarNaLista(alterado);
    return alterado;
  }

  // Passou para outro representante: sai da lista que está aberta.
  private trocarNaLista(cliente: ClienteDoRepresentante): void {
    this.recurso.update(lista => {
      const outros = (lista ?? []).filter(atual => atual.id !== cliente.id);
      const fica = cliente.representanteId === this.representanteId();
      return (fica ? [...outros, cliente] : outros).sort((a, b) => a.nome.localeCompare(b.nome));
    });
  }
}
