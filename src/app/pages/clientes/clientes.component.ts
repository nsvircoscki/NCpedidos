import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientesTableComponent } from '../../components/clientes/clientes-table.component';
import { Cliente } from '../../models/cliente.model';
import { Router } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ClientesStore } from '../../services/clientes-store';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClientesTableComponent,
    RouterModule,
    NgmMotionDirective,
    EsqueletoListaComponent,
    ErroCarregamentoComponent
  ],
  templateUrl: './clientes.component.html'
})
export class ClientesPageComponent {
    private router = inject(Router);

    private readonly clientesStore = inject(ClientesStore);
    readonly clientes = this.clientesStore.clientes;
    readonly carregando = this.clientesStore.carregando;
    readonly erro = this.clientesStore.erro;

    recarregar(): void {
      this.clientesStore.recarregar();
    }
    

  termoBuscaMobile = '';
  clienteMobileSelecionado: Cliente | null = null;
  modalClienteMobileAberto = false;

  get clientesMobile(): Cliente[] {
    const termo = this.termoBuscaMobile.trim().toLowerCase();

    return this.clientes().filter(cliente =>
      !termo ||
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpfcnpj.toLowerCase().includes(termo)
    );
  }

  obterIniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/);
    return partes.length === 1
      ? partes[0].substring(0, 2).toUpperCase()
      : (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  selecionarClienteMobile(cliente: Cliente): void {
    this.clienteMobileSelecionado = cliente;
    this.modalClienteMobileAberto = true;
  }

  clienteMobileEstaSelecionado(cliente: Cliente): boolean {
    return this.modalClienteMobileAberto && this.clienteMobileSelecionado?.id === cliente.id;
  }

  /** Mantém o cliente em clienteMobileSelecionado para o modal animar a saída. */
  @HostListener('document:keydown.escape')
  fecharModalClienteMobile(): void {
    this.modalClienteMobileAberto = false;
  }

  verTabelaDePrecosMobile(cliente: Cliente): void {
    this.fecharModalClienteMobile();
    this.router.navigate(['/clientes', cliente.id, 'tabela-precos']);
  }

  verPedidosMobile(cliente: Cliente): void {
    this.fecharModalClienteMobile();
    this.router.navigate(['/pedidos'], { queryParams: { clienteId: cliente.id } });
  }
}
