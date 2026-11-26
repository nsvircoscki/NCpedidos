import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoService } from '../services/sessao';

export const sessaoGuard: CanActivateFn = () => 
    inject(SessaoService).logado() || inject(Router).createUrlTree(['/login']);

export const visitanteGuard: CanActivateFn = () =>
    !inject(SessaoService).logado() || inject(Router).createUrlTree(['/']);

// Só esconde a tela: quem protege os dados é a API, que confere o admin no banco.
export const adminGuard: CanActivateFn = () =>
    inject(SessaoService).admin() || inject(Router).createUrlTree(['/']);
