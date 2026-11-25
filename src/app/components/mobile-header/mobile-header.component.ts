import { Component, inject } from '@angular/core';
import { TemaService } from '../../services/tema';
import { SessaoService } from '../../services/sessao';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-mobile-header',
    imports: [RouterLink],
    templateUrl: './mobile-header.component.html',
})
export class MobileHeaderComponent {
    readonly tema = inject(TemaService);
    readonly iniciais = inject(SessaoService).iniciais;
}
