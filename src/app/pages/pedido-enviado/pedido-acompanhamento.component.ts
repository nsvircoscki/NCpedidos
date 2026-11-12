import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: 'app-pedido-acompanhamento',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pedido-acompanhamento.component.html',
})
export class PedidoAcompanhamentoComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Quando true, renderiza só o conteúdo (sem sidebar/cabeçalho/navegação), para uso dentro do Pedido enviado. */
  @Input() embutido = false;
  /**
   * Embutido no Pedido enviado: recebe o número pelo @Input.
   * Aberto pela rota (/pedidos/1047/acompanhamento): lê o :id da URL.
   */
  @Input() numeroPedido = this.route.snapshot.paramMap.get('id') ?? '';

  voltarParaPedidos(): void {
    void this.router.navigateByUrl('/pedidos');
  }
}
