import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private minimizadaSubject = new BehaviorSubject<boolean>(
        this.isBrowser && localStorage.getItem('sidebar-minimizada') === 'true'
    );

    minimizada$ = this.minimizadaSubject.asObservable();

    get estadoAtual(): boolean {
        return this.minimizadaSubject.value;
    }

    alternarSidebar(): void {
        const novoEstado = !this.minimizadaSubject.value;

        if (this.isBrowser) {
            localStorage.setItem('sidebar-minimizada', String(novoEstado));
        }

        this.minimizadaSubject.next(novoEstado);
    }
}
