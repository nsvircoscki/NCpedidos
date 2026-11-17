import { validarCNPJ, validarCPF } from '../../validacoes/documentos';
import { Component, inject, signal } from '@angular/core';
import { email, form, maxLength, pattern, required } from '@angular/forms/signals';
import { DadosPreCadastro, TipoCadastro } from '../../models/cliente.model';
import { Router } from '@angular/router';
import { CadastroClienteComponent } from '../../components/cadastro-cliente/cadastro-cliente.component';
import { ObservacoesClienteComponent } from '../../components/cadastro-cliente/observacoes-cliente/observacoes-cliente.component';
import { EscolhaTipoClienteComponent } from '../../components/cadastro-cliente/escolha-tipo-cliente/escolha-tipo-cliente.component';
import { PreCadastrosStore } from '../../services/pre-cadastros-store';

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
    private router = inject(Router);
    private preCadastrosStore = inject(PreCadastrosStore);
    etapaAtual = 1;

    readonly tipoCadastro = signal<TipoCadastro | null>(null);

    readonly etapas = [
        { numero: 1, titulo: 'Dados', descricao: 'Empresa e contato' },
        { numero: 2, titulo: 'Observações', descricao: 'Perfil comercial' },
    ];

    readonly cliente = signal<DadosPreCadastro>({
        cpf: '',
        nomeCompleto: '',
        atuacao: '',
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
        } 
    });

    readonly formulario = form(this.cliente, campo => {
        const PF = () => this.tipoCadastro() === 'PF';
        const PJ = () => this.tipoCadastro() === 'PJ';

        required(campo.cpf, { message: 'Informe o CPF.', when: PF });
        validarCPF(campo.cpf);
        required(campo.nomeCompleto, { message: 'Informe o nome completo.', when: PF });

        required(campo.cnpj, { message: 'Informe o CNPJ.', when: PJ });
        validarCNPJ(campo.cnpj);
        required(campo.razaoSocial, { message: 'Informe a razão social.', when: PJ });

        required(campo.responsavel, { message: 'Informe o nome do contato.' });
        required(campo.telefone, { message: 'Informe o telefone.' });
        required(campo.email, { message: 'Informe o e-mail.' });
        email(campo.email, { message: 'E-mail inválido.' });
        required(campo.cep, { message: 'Informe o CEP.'});
        pattern(campo.cep, /^\d{5}-?\d{3}$/, { message: 'CEP inválido.' });
        required(campo.endereco, { message: 'Informe o endereço.'});
        required(campo.cidade, { message: 'Informe a cidade.'});
        required(campo.uf, { message: 'Informe a UF.' });
        maxLength(campo.uf, 2, { message: 'A UF tem 2 letras.' });
    });

    irParaProximaEtapa(): void {
        this.etapaAtual = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    definirTipo(tipo: TipoCadastro): void {
        this.tipoCadastro.set(tipo);

        // Apaga o que foi digitado no outro tipo, caso a pessoa tenha voltado e trocado.
        const camposDoOutroTipo = tipo === 'PJ'
            ? { cpf: '', nomeCompleto: '' }
            : { cnpj: '', razaoSocial: '', nomeFantasia: '', segmento: '' };
        this.cliente.update(cliente => ({ ...cliente, ...camposDoOutroTipo }));
    }

     voltarParaEscolha(): void {
        this.tipoCadastro.set(null);
    }

    voltar(): void {
        if (this.etapaAtual === 2) {
            this.voltarEtapa();
        } else if (this.tipoCadastro()) {
            this.voltarParaEscolha();
        } else {
            this.cancelar();
        }
    }

    voltarEtapa(): void {
        this.etapaAtual = 1;
    }

    cancelar(): void {
        this.router.navigate(['/clientes']);
    }

    salvarCadastro(): void {
        const tipo = this.tipoCadastro();
        if (!tipo) return;

        const { cpf, cnpj, nomeCompleto, razaoSocial, cidade, uf, observacoes } = this.cliente();
        const PJ = tipo === 'PJ';

        this.preCadastrosStore.adicionar({
            nome: PJ ? razaoSocial : nomeCompleto,
            documento: PJ ? `CNPJ ${cnpj}` : `CPF ${cpf}`,
            representante: 'Camila Moreira',
            cidade,
            uf,
            prioridade: observacoes.destacar,
        });
        this.router.navigate(['/clientes/analise']);
    }
}