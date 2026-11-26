import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroProdutoComponent } from './cadastro-produto.component';
import { provideRouter } from '@angular/router';

describe('CadastroProdutoComponent', () => {
  let component: CadastroProdutoComponent;
  let fixture: ComponentFixture<CadastroProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroProdutoComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroProdutoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
