import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// MVP: sem TemaService, o app fica sempre no modo claro.
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class AppComponent {}
