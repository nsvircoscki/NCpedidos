import { Component, inject } from '@angular/core';
import { NgmMotionDirective, Transition } from '@scripttype/ng-motion';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule, NgmMotionDirective],
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    private readonly sidebarService = inject(SidebarService);
    
    minimizada = this.sidebarService.estadoAtual;

    sidebarAnimation: Transition = {
        type: 'spring',
        stiffness: 200,
        damping: 24,
    };

    constructor() {
        this.sidebarService.minimizada$.subscribe((estado) => {
            this.minimizada = estado;
        });
    }

    alternarSidebar(): void {
        this.sidebarService.alternarSidebar();
    }
}