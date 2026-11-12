import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
    selector:'app-top-header',
    standalone: true,
    imports: [RouterModule, FormsModule],
    templateUrl: './top-header.component.html',
})
export class TopHeaderComponent {
    pesquisaAberta = false;
    termoPesquisa = '';

    // "Pedido enviado" e "Acompanhamento" dependem de um id: por enquanto apontam
    // para um pedido de exemplo (1047) até existirem dados reais.
    paginas = [
        { nome: 'Visão geral', rota: '/dashboard' },
        { nome: 'Pedidos', rota: '/pedidos' },
        { nome: 'Produtos', rota: '/produtos' },
        { nome: 'Novo pedido', rota: '/pedidos/novo' },
        { nome: 'Clientes', rota: '/clientes' },
        { nome: 'Cadastrar cliente', rota: '/clientes/novo' },
        { nome: 'Análise de clientes', rota: '/clientes/analise' },
        { nome: 'Pedido Enviado', rota: '/pedidos/1047' },
        { nome: 'Configurações', rota: '/configuracoes' },
        { nome: 'Acompanhamento do pedido', rota: '/pedidos/1047/acompanhamento' },
    ];

    get paginasFiltradas() {
        const termo = this.normalizar(this.termoPesquisa);

        if (!termo) {
            return [];
        }

        return this.paginas.filter((pagina) =>
        this.normalizar(pagina.nome).includes(termo)
        );
    }

    private normalizar(texto:string): string {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }


    abrirPesquisa(): void {
        this.pesquisaAberta = true;
    }

    fecharPesquisa(): void {
        this.pesquisaAberta = false;
    }
}
