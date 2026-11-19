import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessaoService } from '../services/sessao';

export const errosApiInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const sessao = inject(SessaoService);

    return next(req).pipe(
        catchError((erro: HttpErrorResponse) => {
            const ehNossaApi = req.url.startsWith(environment.apiUrl);
            if (ehNossaApi && erro.status === 401) {
                sessao.sair();
                router.navigate(['/login']);
            }
            return throwError(() => erro);
        }),
    );
};

