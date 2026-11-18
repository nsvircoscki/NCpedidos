import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const errosApiInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((erro: HttpErrorResponse) => {
            const ehNossaApi = req.url.startsWith(environment.apiUrl);
            if (ehNossaApi && erro.status === 401) {
                router.navigate(['/login']);
            }
            return throwError(() => erro);
        }),
    );
};

