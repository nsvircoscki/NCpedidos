import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { SessaoService } from '../services/sessao';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(SessaoService).token();
    const isApiUrl = req.url.startsWith(environment.apiUrl);
    if (!token || !isApiUrl) return next(req);

    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
}