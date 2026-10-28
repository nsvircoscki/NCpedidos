import { Injectable } from '@angular/core';
import { Pedido } from '../models/pedido.model';
import { ItemPedido } from '../models/pedido.model';    
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable( {
    providedIn: 'root'
})


export class PedidoService {
    private pedidos: Pedido[] = [];

    private pedidosSubject = new BehaviorSubject<Pedido[]>(this.pedidos);
    public pedidos$ = this.pedidosSubject.asObservable();

    constructor() {}

    getPedidos(): Observable<Pedido[]> {
        return of(this.pedidos);
    }

    getPedidoById(id: number): Observable<Pedido | undefined> {
        const pedido = this.pedidos.find(p => p.id === id);
        return of(pedido);
    }

    addPedido(novoPedido: Pedido): Observable<Pedido> {
        //calculo de subtotal
        const pedidoProcessado = this.calcularValorTotal(novoPedido);

        //simulaçãode de id auto-incremento
        pedidoProcessado.id = this.pedidos.length > 0
        ? Math.max(...this.pedidos.map(p => p.id || 0)) + 1
        : 1;

        if (!pedidoProcessado.dataCriacao) {
            pedidoProcessado.dataCriacao = new Date().toISOString;
        }
        //salva no array local
        this.pedidos.push(pedidoProcessado);
        this.pedidosSubject.next([...this.pedidos]);

        return of(pedidoProcessado);
    }

    atualizarStatus(id: number, novoStatus: Pedido['status']): Observable<boolean> {
        const pedido = this.pedidos.find(p => p.id === id);
        if (pedido) {
            pedido.status = novoStatus;
            this.pedidosSubject.next([...this.pedidos]);
            return of(true);
        }
        return of(false);
    }

    private calcularValorTotal(pedido: Pedido): Pedido {
        let valorTotal = 0;

        // Adiciona o subtotal a cada item do pedido
        const itensComSubtotal = ItemPedido[] = pedido.itens.map(item => {
            const subtotal = item.quantidade * item.precoUnitario;
            valorTotal += subtotal;
            return { ...item, subtotal};
            
    });

    return { ...pedido, itens: itensComSubtotal, valorTotal };
    }
}
