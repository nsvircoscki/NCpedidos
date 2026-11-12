import { Routes } from '@angular/router';

/**
 * Padrão das rotas de cada recurso:
 *   /recurso              → lista
 *   /recurso/novo         → cadastro
 *   /recurso/:id          → detalhe
 *   /recurso/:id/editar   → edição
 *
 * O login fica fora do layout; as demais telas são filhas do LayoutComponent.
 *
 * Todas as telas usam loadComponent: o código de cada página só é baixado
 * quando ela é aberta pela primeira vez.
 *
 * Dentro de cada grupo, os caminhos fixos (ex.: "novo", "analise") ficam antes
 * de ":id"; senão o Angular trataria "novo" como se fosse um id.
 */
export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        // Telas internas: sidebar, headers e navegação mobile vêm do LayoutComponent.
        // Cada página abaixo é desenhada dentro do <router-outlet> dele.
        path: '',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            {
                path: 'pedidos',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/pedidos/pedidos.component').then(m => m.PedidosComponent),
                    },
                    {
                        path: 'novo',
                        loadComponent: () => import('./pages/cadastro-pedido/cadastro-pedido.component').then(m => m.CadastroPedidoPageComponent),
                    },
                    {
                        path: 'aprovacao',
                        loadComponent: () => import('./pages/aprovacao-pedidos/aprovacao-pedidos.component').then(m => m.AprovacaoPedidosComponent),
                    },
                    {
                        path: 'aprovacao/:id',
                        loadComponent: () => import('./pages/aprovar-pedido/aprovar-pedido.component').then(m => m.AprovarPedidoComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./pages/pedido-enviado/pedido-enviado.component').then(m => m.PedidoEnviadoComponent),
                    },
                    {
                        path: ':id/acompanhamento',
                        loadComponent: () => import('./pages/pedido-enviado/pedido-acompanhamento.component').then(m => m.PedidoAcompanhamentoComponent),
                    },
                ],
            },
            {
                path: 'produtos',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProdutosPageComponent),
                    },
                    {
                        path: 'novo',
                        loadComponent: () => import('./pages/cadastro-produto/cadastro-produto.component').then(m => m.CadastroProdutoComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./pages/detalhe-produto/detalhe-produto.component').then(m => m.DetalheProdutoComponent),
                    },
                    {
                        path: ':id/editar',
                        loadComponent: () => import('./pages/cadastro-produto/cadastro-produto.component').then(m => m.CadastroProdutoComponent),
                    },
                ],
            },
            {
                path: 'clientes',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesPageComponent),
                    },
                    {
                        path: 'novo',
                        loadComponent: () => import('./pages/cadastro-cliente/cadastro-cliente.component').then(m => m.CadastroClientePageComponent),
                    },
                    {
                        path: 'analise',
                        loadComponent: () => import('./pages/analise-clientes/analise-clientes.component').then(m => m.AnaliseClientesPageComponent),
                    },
                    {
                        path: 'analise/:id',
                        loadComponent: () => import('./pages/analise-cliente/analise-cliente.component').then(m => m.AnaliseClientePageComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./pages/cadastro-cliente/cadastro-cliente.component').then(m => m.CadastroClientePageComponent),
                    },
                    {
                        path: ':id/tabela-precos',
                        loadComponent: () => import('./pages/tabela-precos/tabela-precos.component').then(m => m.TabelaPrecosPageComponent),
                    },
                ],
            },
            {
                path: 'configuracoes',
                loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
            },
        ],
    },
    { path: '**', redirectTo: 'dashboard' },
];
