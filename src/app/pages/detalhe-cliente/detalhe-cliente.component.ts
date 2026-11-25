import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientesStore } from '../../services/clientes-store';
import { EsqueletoListaComponent } from '../../components/esqueleto-lista/esqueleto-lista.component';
import { ErroCarregamentoComponent } from '../../components/erro-carregamento/erro-carregamento.component';

@Component({
    selector: 'app-detalhe-cliente',
    imports: [RouterLink, CurrencyPipe, EsqueletoListaComponent, ErroCarregamentoComponent],
    templateUrl: './detalhe-cliente.component.html',
})
export class DetalheClienteComponent {
    private readonly clientesStore = inject(ClientesStore);

    readonly id = input.required({ transform: numberAttribute });
    readonly carregando = this.clientesStore.carregando;
    readonly erro = this.clientesStore.erro;
    readonly cliente = computed(() => this.clientesStore.buscar(this.id()));

    recarregar(): void {
        this.clientesStore.recarregar();
    }
}