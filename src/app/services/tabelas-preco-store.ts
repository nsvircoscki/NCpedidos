import { Service, inject } from '@angular/core';
import { TABELAS_PRECO_EXEMPLO } from '../data/tabelas-preco';
import { ItemTabelaPreco } from '../models/tabela-preco.model';
import { carregarDados } from './carregar-dados';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Service()
export class TabelasPrecoStore {
    private readonly http = inject(HttpClient);
    private readonly recurso = carregarDados('/tabelas-preco', TABELAS_PRECO_EXEMPLO);
    readonly carregando = this.recurso.isLoading;
    readonly erro = this.recurso.error;

    recarregar(): void {
        this.recurso.reload();
    }

    doCliente(clienteId: number): ItemTabelaPreco[] {
        const tabelas = this.recurso.hasValue() ? this.recurso.value() : {};
        return (tabelas[clienteId] ?? []).map(item => ({ ...item }));
    }

    async salvarPreco(clienteId: number, itemId: number, preco: number): Promise<void> {
        if (!environment.usarDadosExemplo) {
            await firstValueFrom(this.http.put(`/clientes/${clienteId}/tabela-precos/${itemId}`, { preco }));
        }
        this.recurso.update(tabelas => ({
            ...tabelas,
            [clienteId]: (tabelas?.[clienteId] ?? []).map(item => (item.id === itemId ? { ...item, preco } : item)),
        }));
    }
}
