import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesPacienteComponent } from './reportes-paciente.component';

describe('ReportesPacienteComponent', () => {
  let component: ReportesPacienteComponent;
  let fixture: ComponentFixture<ReportesPacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportesPacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
