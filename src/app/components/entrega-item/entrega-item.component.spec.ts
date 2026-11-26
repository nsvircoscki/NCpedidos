import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntregaItem } from './entrega-item.component';

describe('EntregaItem', () => {
  let component: EntregaItem;
  let fixture: ComponentFixture<EntregaItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntregaItem],
    }).compileComponents();

    fixture = TestBed.createComponent(EntregaItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entrega', {
      horario: '09:00',
      cliente: 'Casa Almeida',
      endereco: 'Rua das Flores, 120',
      status: 'Em rota',
      cor: 'azul',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
