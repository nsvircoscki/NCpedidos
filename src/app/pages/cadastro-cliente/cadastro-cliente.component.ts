import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CadastroClienteComponent } from '../../components/cadastro-cliente/cadastro-cliente.component';
import { ObservacoesClienteComponent, ObservacoesCliente } from '../../components/cadastro-cliente/observacoes-cliente/observacoes-cliente.component';
import { EscolhaTipoClienteComponent } from '../../components/cadastro-cliente/escolha-tipo-cliente/escolha-tipo-cliente.component';
import { TipoCadastro } from '../../models/cliente.model';

@Component({
    selector: 'app-cadastro-cliente-page',
    standalone: true,
    imports: [
        CadastroClienteComponent,
        ObservacoesClienteComponent,
        EscolhaTipoClienteComponent
    ],
    templateUrl: './cadastro-cliente.component.html',
})
export class CadastroClientePageComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    
    etapaAtual = 1;

    /** null = ainda não respondeu se é PJ ou PF. */
    tipoCadastro: TipoCadastro | null = null;

    readonly etapas = [
        { numero: 1, titulo: 'Dados', descricao: 'Empresa e contato' },
        { numero: 2, titulo: 'Observações', descricao: 'Perfil comercial' },
    ];

    cliente = {
        cpf: '',
        nomeCompleto: '',
        autacao: '',
        segmento: '',
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        responsavel: '',
        telefone: '',
        email: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        perfil: {
            trabalhaComOutrasMarcas: false,
            buscaMelhoresCondicoes: false,
            entregaRecorrente: false,
            interessePreparacao: false,
            novoEmpredimento: false,
            resumoComercial: '',
            melhorHorario: ''
        },
        observacoes: {
            texto: '',
            categoria: 'Perfil comercial',
            destacar: false
        } satisfies ObservacoesCliente
    };


    irParaProximaEtapa(): void {
        this.etapaAtual = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    definirTipo(tipo: TipoCadastro): void {
        this.tipoCadastro = tipo;

        // Apaga o que foi digitado no outro tipo, caso a pessoa tenha voltado e trocado.
        const camposDoOutroTipo = tipo === 'PJ'
            ? { cpf: '', nomeCompleto: '' }
            : { cnpj: '', razaoSocial: '', nomeFantasia: '', segmento: '' };
        this.cliente = { ...this.cliente, ...camposDoOutroTipo };
    }

    voltarParaEscolha(): void {
        this.tipoCadastro = null;
    }

    voltar(): void {
        if (this.etapaAtual === 2) {
            this.voltarEtapa();
        } else if (this.tipoCadastro) {
            this.voltarParaEscolha();
        } else {
            this.cancelar();
        }
    }

    voltarEtapa(): void {
        this.etapaAtual = 1;
    }

    irParaObservacoes(): void {
        this.etapaAtual = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelar(): void {
        this.router.navigate(['/clientes']);
    }

    salvarCadastro(): void {
        console.log('Cadastro completo:', { tipo: this.tipoCadastro, ...this.cliente });
        this.router.navigate(['/clientes']);
    }

    atualizarCliente(evento: { campo: string; valor: string }): void {
    this.cliente = {
      ...this.cliente,
      [evento.campo]: evento.valor
     };
    }
}