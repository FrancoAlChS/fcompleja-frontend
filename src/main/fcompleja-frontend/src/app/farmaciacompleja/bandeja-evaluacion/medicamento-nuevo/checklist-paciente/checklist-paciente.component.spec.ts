import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistPacienteComponent } from './checklist-paciente.component';

describe('ChecklistPacienteComponent', () => {
  let component: ChecklistPacienteComponent;
  let fixture: ComponentFixture<ChecklistPacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistPacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
