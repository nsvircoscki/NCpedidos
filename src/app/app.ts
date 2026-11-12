import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaService } from './services/tema';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class AppComponent {
  // Injetar aqui cria o serviço ao abrir o app, e o tema salvo é aplicado em qualquer tela.
  private readonly tema = inject(TemaService);
}
