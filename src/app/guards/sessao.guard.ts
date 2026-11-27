import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessaoService } from '../services/sessao';

// Com a senha provisória, a única tela liberada é a de criar a própria senha (a API também barra o resto).
export const sessaoGuard: CanActivateFn = () => {
    const sessao = inject(SessaoService);
    const router = inject(Router);
    if (!sessao.logado()) return router.createUrlTree(['/login']);
    return !sessao.precisaTrocarSenha() || router.createUrlTree(['/minha-conta']);
};

export const logadoGuard: CanActivateFn = () =>
    inject(SessaoService).logado() || inject(Router).createUrlTree(['/login']);

export const visitanteGuard: CanActivateFn = () =>
    !inject(SessaoService).logado() || inject(Router).createUrlTree(['/']);

// Só esconde a tela: quem protege os dados é a API, que confere o admin no banco.
// Sem a verificação em duas etapas, o admin vai para a tela de ativar (a API também exige).
export const adminGuard: CanActivateFn = () => {
    const sessao = inject(SessaoService);
    const router = inject(Router);
    if (!sessao.admin()) return router.createUrlTree(['/']);
    return !sessao.precisaAtivarDoisPassos() || router.createUrlTree(['/minha-conta']);
};
