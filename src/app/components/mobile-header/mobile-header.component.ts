import { Component, inject } from '@angular/core';
import { TemaService } from '../../services/tema';

@Component({
    selector: 'app-mobile-header',
    templateUrl: './mobile-header.component.html',
})
export class MobileHeaderComponent {
    readonly tema = inject(TemaService);
}
