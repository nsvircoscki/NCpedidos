import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../components/top-header/top-header.component';
import { MobileHeaderComponent } from '../components/mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../components/mobile-navigation/mobile-navigation.component';
import { SidebarService } from '../services/sidebar';

/**
 * Estrutura comum a todas as telas internas do sistema (tudo menos o login):
 *   - desktop: sidebar fixa à esquerda + header de pesquisa no topo
 *   - mobile:  header com logo no topo + navegação fixa no rodapé
 *
 * A página da rota atual é desenhada no <router-outlet>. Por isso as páginas
 * não devem incluir sidebar, headers nem navegação: só o próprio conteúdo.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopHeaderComponent, MobileHeaderComponent, MobileNavigationComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly sidebarService = inject(SidebarService);

  /** Sidebar minimizada (88px) ou aberta (265px); define a margem do conteúdo no desktop. */
  readonly sidebarMinimizada = toSignal(this.sidebarService.minimizada$, {
    initialValue: this.sidebarService.estadoAtual,
  });
}
