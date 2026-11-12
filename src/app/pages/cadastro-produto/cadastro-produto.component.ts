import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto';

type AbaCadastroProduto = 'informacoes' | 'variacoes' | 'precos';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.component.html',
})
export class CadastroProdutoComponent {
  private produtoService = inject(ProdutoService);

  idProduto: number | null = null;
  modoEdicao = false;
  produtoNaoEncontrado = false;
  abaAtual: AbaCadastroProduto = 'informacoes';
  nomeImagemSelecionada = '';

  produto: Omit<Produto, 'id'> = {
    nome: '',
    codigoSKU: '',
    descricao: '',
    categoria: '',
    embalagem: '',
    estoque: 0,
    preco: 0,
    margem: 0,
    status: 'ATIVO',
    cor: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    const idDaRota = this.route.snapshot.paramMap.get('id');

    if (idDaRota !== null) {
      this.idProduto = Number(idDaRota);
      const produtoExistente = this.produtoService.buscarPorId(this.idProduto);

      if (produtoExistente) {
        this.produto = { ...produtoExistente };
        this.modoEdicao = true;
      } else {
        this.produtoNaoEncontrado = true;
      }
    }
  }

  selecionarAba(aba: AbaCadastroProduto): void {
    this.abaAtual = aba;
  }

  selecionarImagem(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.nomeImagemSelecionada = input.files?.[0]?.name ?? '';
  }

  alternarStatus(evento: Event): void {
    const checkbox = evento.target as HTMLInputElement;
    this.produto.status = checkbox.checked ? 'ATIVO' : 'INATIVO';
  }

  salvar(): void {
    if (this.produtoNaoEncontrado) {
      return;
    }

    if (this.modoEdicao && this.idProduto !== null) {
      const produtoAtualizado = this.produtoService.atualizar(
        this.idProduto,
        this.produto
      );

      if (produtoAtualizado) {
        this.router.navigate(['/produtos', produtoAtualizado.id]);
      }

      return;
    }

    const novoProduto = this.produtoService.adicionar(this.produto);
    this.router.navigate(['/produtos', novoProduto.id]);
  }
}
