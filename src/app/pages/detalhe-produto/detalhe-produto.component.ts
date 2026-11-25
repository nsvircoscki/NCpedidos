import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, numberAttribute, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../services/produto';

@Component({
  standalone: true,
  imports: [
    EsqueletoListaComponent,
    CommonModule,
    RouterLink,
  ],
  selector: 'app-detalhe-produto',
  templateUrl: './detalhe-produto.component.html',
})
export class DetalheProdutoComponent {
  private readonly produtoService = inject(ProdutoService);

  readonly id = input.required({ transform: numberAttribute });
  readonly carregando = this.produtoService.carregando;
  readonly produto = computed(() => this.produtoService.buscarPorId(this.id()));

  get percentualEstoqueDeposito(): number {
    const quantidade = this.produto()?.estoquePorDeposito?.[0]?.quantidade ?? 0;
    const estoqueTotal = this.produto()?.estoque ?? 0;

    return estoqueTotal ? Math.min(100, Math.round((quantidade / estoqueTotal) * 100)) : 0;
  }
}
