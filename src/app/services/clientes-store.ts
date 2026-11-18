import { Service, computed } from '@angular/core';
import { CLIENTES_EXEMPLO } from '../data/clientes';
import { Cliente, ClienteSelecao } from '../models/cliente.model';
import { carregarDados } from './carregar-dados';

@Service()
export class ClientesStore {
    private readonly recurso = carregarDados('/clientes', CLIENTES_EXEMPLO);

    readonly clientes = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
    readonly carregando = this.recurso.isLoading;
    readonly erro = this.recurso.error;
    readonly paraSelecao = computed(() => this.clientes().map(paraSelecao));

    buscar(id: number): Cliente | undefined {
        return this.clientes().find(cliente => cliente.id === id);
    }

    recarregar(): void {
        this.recurso.reload();
    }
}

function paraSelecao(cliente: Cliente): ClienteSelecao {
    return {
        id: cliente.id,
        nome: cliente.nome,
        documento: documentoComTipo(cliente),
        limite: cliente.limite,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        uf: cliente.uf
    };
}

export function documentoComTipo(cliente: Cliente): string {
    const tipo = cliente.tipo === 'Pessoa Física' ? 'CPF' : 'CNPJ';
    return `${tipo}: ${cliente.cpfcnpj}`;
}



