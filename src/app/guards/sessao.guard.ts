import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoService } from '../services/sessao';

export const sessaoGuard: CanActivateFn = () => 
    inject(SessaoService).logado() || inject(Router).createUrlTree(['/login']);

export const visitanteGuard: CanActivateFn = () =>
    !inject(SessaoService).logado() || inject(Router).createUrlTree(['/dashboard']);  