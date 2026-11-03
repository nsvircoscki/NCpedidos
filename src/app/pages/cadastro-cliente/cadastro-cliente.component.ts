import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { SidebarService } from '../../services/sidebar';
import { CadastroClienteComponent } from '../../components/cadastro-cliente/cadastro-cliente.component';
import { PerfilClienteComponent } from '../../components/cadastro-cliente/perfil-cliente/perfil-cliente.component';

@Component({
    selector: 'app-cadastro-cliente-page',
    standalone: true,
    imports: [
        SidebarComponent,
        TopHeaderComponent,
        CadastroClienteComponent,
        PerfilClienteComponent
    ],
    templateUrl: './cadastro-cliente.component.html',
})
export class CadastroClientePageComponent {
    private sidebarService = inject(SidebarService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    
    sidebarMinimizada = false;
    etapaAtual = 1;

    cliente = {
        tipo: 'PJ' as 'PJ' | 'PF',
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        responsavel: '',
        telefone: '',
        email: '',
        endereco: '',
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
        }
    };

     constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }

    irParaProximaEtapa(): void {
        this.etapaAtual = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    voltarEtapa(): void {
        this.etapaAtual = 1;
    }

    cancelar(): void {
        this.router.navigate(['/clientes']);
    }

    salvarCadastro(): void {
        console.log('Cadastro completo:', this.cliente);
        this.router.navigate(['/clientes']);
    }
}