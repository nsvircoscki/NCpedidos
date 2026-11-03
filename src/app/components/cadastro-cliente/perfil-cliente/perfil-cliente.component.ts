import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilCliente } from '../../../models/perfil-cliente.model';

@Component({
    selector: 'app-perfil-cliente',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './perfil-cliente.component.html',
})
export class PerfilClienteComponent {
    @Input() cliente!: {
        nome?: string;
        razaoSocial?: string;
        cnpj?: string;
        cidade?: string;
        responsavel?: string;
    };

    @Input() perfil!: PerfilCliente;

    @Output() voltar = new EventEmitter<void>();
    @Output() salvar = new EventEmitter<void>();
    @Output() cancelar = new EventEmitter<void>();

    voltarEtapa(): void {
        this.voltar.emit();
    }

    salvarPerfil(): void {
        this.salvar.emit();
    }

    cancelarCadastro(): void {
        this.cancelar.emit();
    }
}
