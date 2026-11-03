import { Component } from '@angular/core';
import { Entrega } from '../../models/entrega.model';
import { EntregaItem } from '../entrega-item/entrega-item.component';

@Component({
  imports: [EntregaItem],
  selector: 'app-proximas-entregas',
  standalone: true,
  templateUrl: './proximas-entregas.component.html',
})
export class ProximasEntregas {
  entregas: Entrega[] = [
  {
    horario: '10:30',
    cliente: 'Casa Almeida Materiais',
    endereco: 'Endereço do cliente',
    status: 'Em rota',
    cor: 'azul'
  },
  {
    horario: '11:15',
    cliente: 'Depósito São Lucas',
    endereco: 'Endereço do cliente',
    status: 'Preparando',
    cor: 'amarelo'
  },
  {
    horario: '13:40',
    cliente: 'Tintas & Cia',
    endereco: 'Endereço do cliente',
    status: 'Aguardando',
    cor: 'cinza'
  },
  {
    horario: '15:00',
    cliente: 'Constrular Materiais',
    endereco: 'Endereço do cliente',
    status: 'Agendada',
    cor: 'cinza'
  }
];
}
