import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalheProdutoComponent } from './detalhe-produto.component';
import { provideRouter } from '@angular/router';

describe('DetalheProdutoComponent', () => {
  let component: DetalheProdutoComponent;
  let fixture: ComponentFixture<DetalheProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheProdutoComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheProdutoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 1);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
