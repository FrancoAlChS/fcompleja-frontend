import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenciaInstitucionalesComponent } from './preferencia-institucionales.component';

describe('PreferenciaInstitucionalesComponent', () => {
  let component: PreferenciaInstitucionalesComponent;
  let fixture: ComponentFixture<PreferenciaInstitucionalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferenciaInstitucionalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferenciaInstitucionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
