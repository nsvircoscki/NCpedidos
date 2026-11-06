import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { ProdutosComponent } from '../../components/produtos/produtos-table.component';
import { Produto } from '../../models/produto.model';
import { SidebarService } from '../../services/sidebar';

@Component({
    selector: 'app-produtos-page',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, MobileHeaderComponent, TopHeaderComponent, ProdutosComponent, MobileNavigationComponent],
    templateUrl: './produtos.component.html',
})
export class ProdutosPageComponent { 
    private sidebarService = inject(SidebarService);
    sidebarMinimizada = false;

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }

    termoBuscaMobile = '';

    get produtosMobile(): Produto[] {
      const termo = this.termoBuscaMobile.trim().toLowerCase();

      return this.produtos.filter(produto =>
        !termo ||
        produto.nome.toLowerCase().includes(termo) ||
        produto.codigoSKU.toLowerCase().includes(termo)
      );
    }

    produtos: Produto[] = [
  {
    id: 1,
    nome: 'Tinta Acrílica Premium',
    codigoSKU: 'ACR-PRO-18-BN',
    descricao: 'Tinta acrílica premium',
    categoria: 'Paredes',
    embalagem: '18 L',
    estoque: 124,
    preco: 289.90,
    margem: 38.4,
    status: 'ATIVO',
    cor: 'Branco Neve'
  },
  {
    id: 2,
    nome: 'Tinta Acrílica Standard',
    codigoSKU: 'ACR-STD-18-GE',
    descricao: 'Tinta acrílica standard',
    categoria: 'Paredes',
    embalagem: '18 L',
    estoque: 86,
    preco: 219.90,
    margem: 35.1,
    status: 'ATIVO',
    cor: 'Gelo'
  },
  {
    id: 3,
    nome: 'Massa Corrida',
    codigoSKU: 'MAS-001-25',
    descricao: 'Massa corrida para acabamento',
    categoria: 'Preparação',
    embalagem: '25 kg',
    estoque: 42,
    preco: 89.90,
    margem: 29.5,
    status: 'INATIVO',
    cor: 'Branco'
  }
  ];
}