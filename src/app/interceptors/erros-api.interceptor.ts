import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessaoService } from '../services/sessao';

export const errosApiInterceptor: HttpInterceptorFn = (req, next) => {
    const sessao = inject(SessaoService);

    return next(req).pipe(
        catchError((erro: HttpErrorResponse) => {
            const ehNossaApi = req.url.startsWith(environment.apiUrl);
            if (ehNossaApi && erro.status === 401) {
                sessao.sair();
            }
            return throwError(() => erro);
        }),
    );
};

