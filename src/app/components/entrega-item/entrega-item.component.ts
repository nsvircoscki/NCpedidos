import { Component, Input } from '@angular/core';
import { Entrega } from '../../models/entrega.model';

@Component({
  selector: 'app-entrega-item',
  styleUrl: './entrega-item.component.scss',
  templateUrl: './entrega-item.component.html',
  standalone: true
})
export class EntregaItem {
  @Input({ required: true}) entrega!: Entrega;
}
