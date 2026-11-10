import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../../components/mobile-navigation/mobile-navigation.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto';
import { SidebarService } from '../../services/sidebar';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SidebarComponent,
    TopHeaderComponent,
    MobileHeaderComponent,
    MobileNavigationComponent,
  ],
  selector: 'app-detalhe-produto',
  templateUrl: './detalhe-produto.component.html',
})
export class DetalheProdutoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly produtoService = inject(ProdutoService);
  private readonly sidebarService = inject(SidebarService);

  produto?: Produto;
  sidebarMinimizada = this.sidebarService.estadoAtual;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.produto = this.produtoService.buscarPorId(id);

    this.sidebarService.minimizada$.subscribe((estado) => {
      this.sidebarMinimizada = estado;
    });
  }

  get percentualEstoqueDeposito(): number {
    const quantidade = this.produto?.estoquePorDeposito?.[0]?.quantidade ?? 0;
    const estoqueTotal = this.produto?.estoque ?? 0;

    return estoqueTotal ? Math.min(100, Math.round((quantidade / estoqueTotal) * 100)) : 0;
  }
}
