import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProdutosPageComponent } from './pages/produtos/produtos.component';
import { ClientesPageComponent } from './pages/clientes/clientes.component';
import { CadastroClientePageComponent } from './pages/cadastro-cliente/cadastro-cliente.component';
import { CadastroPedidoPageComponent } from './pages/cadastro-pedido/cadastro-pedido.component';
import { AnaliseClientePageComponent } from './pages/analise-cliente/analise-cliente.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';
import { TabelaPrecosPageComponent } from './pages/tabela-precos/tabela-precos.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { PedidoEnviadoComponent } from './components/pedido-enviado/pedido-enviado.component';
import { PedidoAcompanhamentoComponent } from './components/pedido-enviado/pedido-acompanhamento.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'pedidos', component: PedidosComponent },
    { path: 'produtos', component: ProdutosPageComponent },
    { path: 'clientes', component: ClientesPageComponent },
    { path: 'clientes/novo', component: CadastroClientePageComponent },
    { path: 'clientes/analise', component: AnaliseClientePageComponent },
    { path: 'clientes/:id/tabela-precos', component: TabelaPrecosPageComponent },
    { path: 'clientes/:id', component: CadastroClientePageComponent },
    { path: 'cadastro-pedido', component: CadastroPedidoPageComponent },
    { path: 'configuracoes', component: ConfiguracoesComponent },
    { path: 'pedido-enviado', component: PedidoEnviadoComponent },
    { path: 'pedido-acompanhamento', component: PedidoAcompanhamentoComponent },
    { path: '**', redirectTo: 'dashboard'},
];
