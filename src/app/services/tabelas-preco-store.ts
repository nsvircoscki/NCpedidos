import { Service } from '@angular/core';
import { TABELAS_PRECO_EXEMPLO } from '../data/tabelas-preco';
import { ItemTabelaPreco } from '../models/tabela-preco.model';
import { carregarExemplo } from './carregar-exemplo';

@Service()
export class TabelasPrecoStore {
    private readonly recurso = carregarExemplo(TABELAS_PRECO_EXEMPLO);
    readonly carregando = this.recurso.isLoading;

    doCliente(clienteId: number): ItemTabelaPreco[] {
        const tabelas = this.recurso.hasValue() ? this.recurso.value() : {};
        return (tabelas[clienteId] ?? []).map(item => ({ ...item }));
    }
}
