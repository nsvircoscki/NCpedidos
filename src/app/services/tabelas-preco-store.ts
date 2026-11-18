import { Service } from '@angular/core';
import { TABELAS_PRECO_EXEMPLO } from '../data/tabelas-preco';
import { ItemTabelaPreco } from '../models/tabela-preco.model';
import { carregarDados } from './carregar-dados';

@Service()
export class TabelasPrecoStore {
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
}
