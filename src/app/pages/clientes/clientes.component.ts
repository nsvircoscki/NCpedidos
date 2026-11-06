import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { ClientesTableComponent } from '../../components/clientes/clientes-table.component';
import { Cliente } from '../../models/cliente.model';
import { SidebarService } from '../../services/sidebar';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    TopHeaderComponent,
    ClientesTableComponent,
    RouterModule,
    MobileNavigationComponent,
    MobileHeaderComponent
  ],
  templateUrl: './clientes.component.html'
})
export class ClientesPageComponent {
    private sidebarService = inject(SidebarService);
    
    sidebarMinimizada = false;

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }

    clientes: Cliente[] = [
    {
      id: 1,
      nome: 'Casa Almeida Materiais',
      cpfcnpj: '12.345.678/0001-90',
      email: 'contato@casaalmeida.com',
      telefone: '(11) 99999-0000',
      dataNascimento: '',
      dataCadastro: '2026-01-10',
      endereco: 'Rua Principal, 100',
      cidade: 'São Paulo',
      uf: 'SP',
      tipo: 'Pessoa Jurídica',
      totalComprado: 12500,
      ultimaCompra: '2026-10-20',
      status: 'ATIVO'
    },
    {
      id: 2,
      nome: 'João da Silva',
      cpfcnpj: '123.456.789-00',
      email: 'joao@example.com',
      telefone: '(11) 98888-0000',
      dataNascimento: '1985-04-15',
      dataCadastro: '2026-02-05',
      endereco: 'Rua das Flores, 25',
      cidade: 'Campinas',
      uf: 'SP',
      tipo: 'Pessoa Física',
      totalComprado: 3240.50,
      ultimaCompra: '2026-09-12',
      status: 'ATIVO'
    },
    {
      id: 3,
      nome: 'Constrular Materiais',
      cpfcnpj: '98.765.432/0001-10',
      email: 'contato@constrular.com',
      telefone: '(19) 97777-0000',
      dataNascimento: '',
      dataCadastro: '2026-03-18',
      endereco: 'Avenida Central, 500',
      cidade: 'Sorocaba',
      uf: 'SP',
      tipo: 'Pessoa Jurídica',
      totalComprado: 8900,
      ultimaCompra: '2026-08-30',
      status: 'INATIVO'
    }
  ];

  termoBuscaMobile = '';

  get clientesMobile(): Cliente[] {
    const termo = this.termoBuscaMobile.trim().toLowerCase();

    return this.clientes.filter(cliente =>
      !termo ||
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpfcnpj.toLowerCase().includes(termo)
    );
  }

  obterIniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return partes.length === 1
      ? partes[0].substring(0, 2).toUpperCase()
      : (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
}