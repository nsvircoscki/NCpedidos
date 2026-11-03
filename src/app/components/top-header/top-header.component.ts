import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector:'app-top-header',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './top-header.component.html',
})
export class TopHeaderComponent {}