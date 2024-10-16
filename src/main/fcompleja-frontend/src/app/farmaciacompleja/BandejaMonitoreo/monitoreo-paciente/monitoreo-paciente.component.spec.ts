import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoreoPacienteComponent } from './monitoreo-paciente.component';

describe('MonitoreoPacienteComponent', () => {
  let component: MonitoreoPacienteComponent;
  let fixture: ComponentFixture<MonitoreoPacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoreoPacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoreoPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
