import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { Produto } from '../../models/produto.model';
import { SidebarService } from '../../services/sidebar';
import { ProdutoService } from '../../services/produto';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-produtos-page',
    standalone: true,
    imports: [CommonModule, FormsModule, SidebarComponent, MobileHeaderComponent, TopHeaderComponent, MobileNavigationComponent, RouterLink],
    templateUrl: './produtos.component.html',
})
export class ProdutosPageComponent { 
    private sidebarService = inject(SidebarService);
    sidebarMinimizada = false;

    private produtoService = inject(ProdutoService);

    constructor() {
      this.produtos = this.produtoService.listar();

        this.sidebarService.minimizada$.subscribe((estado) => {
            this.sidebarMinimizada = estado;
        });
    }

    clienteSelecionado = '';
    seletorClientesAberto = false;

    clientes = [
      { id: 'casa-almeida', nome: 'Casa Almeida Materiais' },
      { id: 'joao-silva', nome: 'João da Silva' },
      { id: 'constrular', nome: 'Constrular Materiais' },
    ];

    get iniciaisCliente(): string {
      const cliente = this.clientes.find((item) => item.id === this.clienteSelecionado);

      if (!cliente) {
        return '—';
      }

      return cliente.nome
        .split(' ')
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();
    }

    get nomeClienteSelecionado(): string {
      return this.clientes.find((cliente) => cliente.id === this.clienteSelecionado)?.nome
        ?? 'Selecione um cliente';
    }

    selecionarCliente(clienteId: string): void {
      this.clienteSelecionado = clienteId;
      this.seletorClientesAberto = false;
    }

    iniciaisDoNome(nome: string): string {
      return nome
        .split(' ')
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();
    }

    categoriaSelecionada = 'Todas';

    get categoriasMobile(): string[] {
      const categorias = this.produtos.map((produto) => produto.categoria);
      return ['Todas', ...new Set(categorias)];
    }

    termoBuscaMobile = '';

    precoDoProduto(produto: Produto): number {
      if (!this.clienteSelecionado) {
        return produto.preco;
      }

      return produto.precosPorCliente?.[this.clienteSelecionado] ?? produto.preco;
    }

    get produtosMobile(): Produto[] {
      const termo = this.termoBuscaMobile.trim().toLowerCase();

      return this.produtos.filter((produto) => {
        const combinaComBusca =
          !termo ||
          produto.nome.toLowerCase().includes(termo) ||
          produto.codigoSKU.toLowerCase().includes(termo);

        const combinaComCategoria =
          this.categoriaSelecionada === 'Todas' ||
          produto.categoria === this.categoriaSelecionada;

        return combinaComBusca && combinaComCategoria;
      });
    }

    produtos: Produto[] = [];
}
