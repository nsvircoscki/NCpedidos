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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
