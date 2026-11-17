import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { ProdutoService } from '../../services/produto';
import { ErroCampoComponent } from '../../components/erro-campo/erro-campo.component';

type AbaCadastroProduto = 'informacoes' | 'variacoes' | 'precos';

@Component({
  standalone: true,
  imports: [
    EsqueletoListaComponent,
    CommonModule,
    FormField,
    ErroCampoComponent,
    RouterLink,
  ],
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.component.html',
})
export class CadastroProdutoComponent {
  private produtoService = inject(ProdutoService);
  readonly carregando = this.produtoService.carregando;

  idProduto: number | null = null;
  modoEdicao = false;
  produtoNaoEncontrado = false;
  abaAtual: AbaCadastroProduto = 'informacoes';
  nomeImagemSelecionada = '';

  readonly produto = signal<Omit<Produto, 'id'>>({
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
  });

  readonly formulario = form(this.produto, campo => {
    required(campo.nome, { message: 'Informe o nome do produto.' });
    required(campo.codigoSKU, { message: 'Informe o código SKU do produto.' });
    required(campo.categoria, { message: 'Informe a categoria do produto.' });
    required(campo.embalagem, { message: 'Informe a embalagem do produto.' });
    min(campo.preco, 0.01, { message: 'O preço precisa ser maior que zero.' });
    min(campo.estoque, 0, { message: 'O estoque não pode ser negativo.' });
    min(campo.margem, 0, { message: 'A margem não pode ser negativa.' });
    max(campo.margem, 100, { message: 'A margem não pode ser maior que 100%.' });
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    const idDaRota = this.route.snapshot.paramMap.get('id');

    if (idDaRota !== null) {
      const id = Number(idDaRota);
      this.idProduto = id;
      // Só dá para preencher o formulário depois que a lista de produtos chegar.
      effect(() => {
        if (this.carregando()) return;
        untracked(() => this.preencherFormulario(id));
      });
    }
  }

  private preencherFormulario(id: number): void {
    const produtoExistente = this.produtoService.buscarPorId(id);

    if (produtoExistente) {
      this.produto.set({ ...produtoExistente });
      this.modoEdicao = true;
    } else {
      this.produtoNaoEncontrado = true;
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
    this.produto.update(produto => ({ ...produto, status: checkbox.checked ? 'ATIVO' : 'INATIVO' }));
  }

  private primeiraAbaComErro(): AbaCadastroProduto | null {
    const campo = this.formulario;
    if (campo.nome().invalid() || campo.codigoSKU().invalid() || campo.categoria().invalid()) return 'informacoes';
    if (campo.embalagem().invalid()) return 'variacoes';
    if (campo.preco().invalid() || campo.estoque().invalid() || campo.margem().invalid()) return 'precos';
    return null;
  }

  salvar(evento: Event): void {
    evento.preventDefault();
    if (this.produtoNaoEncontrado) return;

    this.formulario().markAsTouched();
    const abaComErro = this.primeiraAbaComErro();
    if (abaComErro) {
      this.abaAtual = abaComErro;
      return;
    }

    if (this.modoEdicao && this.idProduto !== null) {
      const produtoAtualizado = this.produtoService.atualizar(
        this.idProduto,
        this.produto()
      );

      if (produtoAtualizado) {
        this.router.navigate(['/produtos', produtoAtualizado.id]);
      }

      return;
    }

    const novoProduto = this.produtoService.adicionar(this.produto());
    this.router.navigate(['/produtos', novoProduto.id]);
  }
}
