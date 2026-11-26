import { Routes } from '@angular/router';
import { adminGuard, sessaoGuard, visitanteGuard } from './guards/sessao.guard';

/**
 * Branch do sistema provisório (MVP): login, a tela do pedido rápido e o cadastro de usuários (admin).
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
        path: 'usuarios',
        title: 'Usuários - NC Tintas',
        canActivate: [sessaoGuard, adminGuard],
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    },
    { path: '**', redirectTo: '' },
];
