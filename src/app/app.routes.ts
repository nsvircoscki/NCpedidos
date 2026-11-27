import { Routes } from '@angular/router';
import { adminGuard, logadoGuard, sessaoGuard, visitanteGuard } from './guards/sessao.guard';

/**
 * Branch do sistema provisório (MVP): login, a tela do pedido rápido e as telas do admin (usuários, clientes e tabelas).
 * As outras telas continuam no código, mas sem rota; o sistema completo está no main.
 */
export const routes: Routes = [
    {
        path: 'login',
        title: 'Entrar - NC Tintas',
        canActivate: [visitanteGuard],
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: '',
        title: 'Novo pedido - NC Tintas',
        canActivate: [sessaoGuard],
        loadComponent: () => import('./pages/pedido-rapido/pedido-rapido.component').then(m => m.PedidoRapidoComponent),
    },
    {
        path: 'minha-conta',
        title: 'Minha conta - NC Tintas',
        canActivate: [logadoGuard],
        loadComponent: () => import('./pages/minha-conta/minha-conta.component').then(m => m.MinhaContaComponent),
    },
    {
        path: 'usuarios',
        title: 'Usuários - NC Tintas',
        canActivate: [sessaoGuard, adminGuard],
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    },
    {
        path: 'clientes',
        title: 'Clientes - NC Tintas',
        canActivate: [sessaoGuard, adminGuard],
        loadComponent: () => import('./pages/clientes-admin/clientes-admin.component').then(m => m.ClientesAdminComponent),
    },
    {
        path: 'tabelas',
        title: 'Tabelas de preço - NC Tintas',
        canActivate: [sessaoGuard, adminGuard],
        loadComponent: () => import('./pages/tabelas-admin/tabelas-admin.component').then(m => m.TabelasAdminComponent),
    },
    {
        path: 'auditoria',
        title: 'Registro - NC Tintas',
        canActivate: [sessaoGuard, adminGuard],
        loadComponent: () => import('./pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
    },
    { path: '**', redirectTo: '' },
];
