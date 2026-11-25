import { Component, inject } from '@angular/core';
import { SessaoService } from '../../services/sessao'
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
    private readonly sessao = inject(SessaoService);
    readonly usuario = this.sessao.usuario;
    readonly iniciais = this.sessao.iniciais;
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

    sair(): void {
        this.sessao.sair();
    }

    alternarSidebar(): void {
        this.sidebarService.alternarSidebar();
    }
}