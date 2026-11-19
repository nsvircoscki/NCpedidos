import { Service, computed, inject } from '@angular/core';
import { PRE_CADASTROS } from '../data/pre-cadastros';
import { PreCadastro, StatusPreCadastro } from '../models/cliente.model';
import { carregarDados } from './carregar-dados';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class PreCadastrosStore {
    private readonly http = inject(HttpClient);
    private readonly recurso = carregarDados('/pre-cadastros', PRE_CADASTROS);
    readonly preCadastros = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));
    readonly carregando = this.recurso.isLoading;
    readonly erro = this.recurso.error;

    recarregar(): void {
        this.recurso.reload();
    }

    buscar(id: number): PreCadastro | undefined {
        return this.preCadastros().find(cadastro => cadastro.id === id);
    }

    async aprovar(id: number): Promise<void> {
        if (!environment.usarDadosExemplo) {
            await firstValueFrom(this.http.post(`/pre-cadastros/${id}/aprovar`, {}));
        }
        this.alterarStatus(id, 'Aprovado');
    }

    async recusar(id: number): Promise<void> {
        if (!environment.usarDadosExemplo) {
            await firstValueFrom(this.http.post(`/pre-cadastros/${id}/recusar`, {}));
        }
        this.alterarStatus(id, 'Rejeitado');
    }

    async adicionar(dados: Omit<PreCadastro, 'id' | 'status' | 'enviadoEm'>): Promise<PreCadastro> {
        const novoCadastro = environment.usarDadosExemplo
            ? this.montarCadastroLocal(dados)
            : await firstValueFrom(this.http.post<PreCadastro>('/pre-cadastros', dados));

        this.recurso.set([novoCadastro, ...this.preCadastros()]);
        return novoCadastro;
    }

    private montarCadastroLocal(dados: Omit<PreCadastro, 'id' | 'status' | 'enviadoEm'>): PreCadastro {
        return {
            ...dados,
            id: this.proximoId(),
            enviadoEm: `Hoje, ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date())}`,
            status: 'Aguardando análise',
        };
    }

    private proximoId(): number {
        const ids = this.preCadastros().map(cadastro => cadastro.id);
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    private alterarStatus(id: number, status: StatusPreCadastro): void {
        this.recurso.set(this.preCadastros().map(cadastro => (cadastro.id === id ? { ...cadastro, status } : cadastro)));
    }
}
