import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroResultadoEvaluacionComponent } from './registro-resultado-evaluacion.component';

describe('RegistroResultadoEvaluacionComponent', () => {
  let component: RegistroResultadoEvaluacionComponent;
  let fixture: ComponentFixture<RegistroResultadoEvaluacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroResultadoEvaluacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroResultadoEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
