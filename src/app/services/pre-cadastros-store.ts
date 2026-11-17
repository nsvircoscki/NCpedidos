import { Service, computed } from '@angular/core';
import { PRE_CADASTROS } from '../data/pre-cadastros';
import { PreCadastro, StatusPreCadastro } from '../models/cliente.model';
import { carregarExemplo } from './carregar-exemplo';

@Service()
export class PreCadastrosStore {
    private readonly recurso = carregarExemplo(PRE_CADASTROS);
    readonly preCadastros = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
    readonly carregando = this.recurso.isLoading;

    buscar(id: number): PreCadastro | undefined {
        return this.preCadastros().find(cadastro => cadastro.id === id);
    }

    aprovar(id: number): void {
        this.alterarStatus(id, 'Aprovado');
    }

    recusar(id: number): void {
        this.alterarStatus(id, 'Rejeitado');
    }

    adicionar(dados: Omit<PreCadastro, 'id' | 'enviadoEm' | 'status'>): PreCadastro {
        const novoCadastro: PreCadastro = {
            ...dados,
            id: this.proximoId(),
            enviadoEm: `Hoje, ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short'}).format(new Date())}`,
            status: 'Aguardando análise'
        };
        this.recurso.set([novoCadastro, ...this.preCadastros()]);
        return novoCadastro;
    }

    private proximoId(): number {
        const ids = this.preCadastros().map(cadastro => cadastro.id);
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    private alterarStatus(id: number, status: StatusPreCadastro): void {
        this.recurso.set(this.preCadastros().map(cadastro => (cadastro.id === id ? { ...cadastro, status } : cadastro)));
    }
}
