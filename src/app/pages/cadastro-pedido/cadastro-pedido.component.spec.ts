import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroPedido } from './cadastro-pedido.component';

describe('CadastroPedido', () => {
  let component: CadastroPedido;
  let fixture: ComponentFixture<CadastroPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
