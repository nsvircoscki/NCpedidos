import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  selector: 'app-detalhe-produto',
  templateUrl: './detalhe-produto.component.html',
})
export class DetalheProdutoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly produtoService = inject(ProdutoService);

  produto?: Produto;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.produto = this.produtoService.buscarPorId(id);

  }

  get percentualEstoqueDeposito(): number {
    const quantidade = this.produto?.estoquePorDeposito?.[0]?.quantidade ?? 0;
    const estoqueTotal = this.produto?.estoque ?? 0;

    return estoqueTotal ? Math.min(100, Math.round((quantidade / estoqueTotal) * 100)) : 0;
  }
}
