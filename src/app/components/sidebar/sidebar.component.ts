import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    private readonly sidebarService = inject(SidebarService);
    
    minimizada = this.sidebarService.estadoAtual;

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.minimizada = estado;
        });
    }

    alternarSidebar(): void {
        this.sidebarService.alternarSidebar();
    }
}