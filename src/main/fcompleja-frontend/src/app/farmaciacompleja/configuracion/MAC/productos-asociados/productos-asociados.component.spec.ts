import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosAsociadosComponent } from './productos-asociados.component';

describe('ProductosAsociadosComponent', () => {
  let component: ProductosAsociadosComponent;
  let fixture: ComponentFixture<ProductosAsociadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductosAsociadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductosAsociadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
