import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosEvolucionComponent } from './resultados-evolucion.component';

describe('ResultadosEvolucionComponent', () => {
  let component: ResultadosEvolucionComponent;
  let fixture: ComponentFixture<ResultadosEvolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultadosEvolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultadosEvolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
