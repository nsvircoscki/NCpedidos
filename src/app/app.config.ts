import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errosApiInterceptor } from './interceptors/erros-api.interceptor';
import { urlApiInterceptor } from './interceptors/url-api.interceptor';
import { tokenInterceptor } from './interceptors/token.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(),
    provideHttpClient(withInterceptors([urlApiInterceptor, tokenInterceptor, errosApiInterceptor])),

    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
