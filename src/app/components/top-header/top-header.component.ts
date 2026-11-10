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

    paginas = [
        { nome: 'Visão geral', rota: '/dashboard' },
        { nome: 'Pedidos', rota: '/pedidos' },
        { nome: 'Produtos', rota: '/produtos' },
        { nome: 'Novo pedido', rota: '/cadastro-pedido' },
        { nome: 'Clientes', rota: '/clientes' },
        { nome: 'Cadastrar cliente', rota: '/clientes/novo' },
        { nome: 'Análise de clientes', rota: '/clientes/analise' },
        { nome: 'Pedido Enviado', rota: '/pedido-enviado' },
        { nome: 'Configurações', rota: '/configuracoes' },
        { nome: 'Acompanhamento do pedido', rota: '/pedido-acompanhamento' },
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
