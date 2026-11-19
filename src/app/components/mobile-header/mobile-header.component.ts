import { Component, inject } from '@angular/core';
import { TemaService } from '../../services/tema';
import { SessaoService } from '../../services/sessao';

@Component({
    selector: 'app-mobile-header',
    templateUrl: './mobile-header.component.html',
})
export class MobileHeaderComponent {
    readonly tema = inject(TemaService);
    readonly iniciais = inject(SessaoService).iniciais;
}
