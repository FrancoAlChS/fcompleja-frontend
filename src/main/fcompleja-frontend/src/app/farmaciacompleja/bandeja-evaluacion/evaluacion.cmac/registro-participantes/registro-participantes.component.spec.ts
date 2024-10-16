import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroParticipantesComponent } from './registro-participantes.component';

describe('RegistroParticipantesComponent', () => {
  let component: RegistroParticipantesComponent;
  let fixture: ComponentFixture<RegistroParticipantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroParticipantesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroParticipantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
