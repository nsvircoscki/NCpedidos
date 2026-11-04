import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ObservacoesCliente {
    texto: string;
    categoria: 'Perfil comercial' | 'Entrega' | 'Pagamento';
    destacar: boolean;
}

@Component({
    selector: 'app-observacoes-cliente',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './observacoes-cliente.component.html',
})
export class ObservacoesClienteComponent {
    @Input() observacoes!: ObservacoesCliente;
    @Input() perfil!: {
        trabalhaComOutrasMarcas: boolean;
        buscaMelhoresCondicoes: boolean;
        entregaRecorrente: boolean;
        interessePreparacao: boolean;
        novoEmpredimento: boolean;
    };

    @Output() voltar = new EventEmitter<void>();
    @Output() salvar = new EventEmitter<void>();
    @Output() cancelar = new EventEmitter<void>();

    readonly limiteCaracteres = 600;

    voltarEtapa(): void {
        this.voltar.emit();
    }

    salvarObservacoes(): void {
        this.salvar.emit();
    }

    cancelarCadastro(): void {
        this.cancelar.emit();
    }
}
