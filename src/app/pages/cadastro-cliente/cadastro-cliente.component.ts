import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CadastroClienteComponent } from '../../components/cadastro-cliente/cadastro-cliente.component';
import { ObservacoesClienteComponent, ObservacoesCliente } from '../../components/cadastro-cliente/observacoes-cliente/observacoes-cliente.component';

@Component({
    selector: 'app-cadastro-cliente-page',
    standalone: true,
    imports: [
        CadastroClienteComponent,
        ObservacoesClienteComponent
    ],
    templateUrl: './cadastro-cliente.component.html',
})
export class CadastroClientePageComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    
    etapaAtual = 1;

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
        console.log('Cadastro completo:', this.cliente);
        this.router.navigate(['/clientes']);
    }

    atualizarCliente(evento: { campo: string; valor: string }): void {
    this.cliente = {
      ...this.cliente,
      [evento.campo]: evento.valor
     };
    }
}