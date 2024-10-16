import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionCmacComponent } from './evaluacion.cmac.component';

describe('Evaluacion.CmacComponent', () => {
  let component: EvaluacionCmacComponent;
  let fixture: ComponentFixture<EvaluacionCmacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionCmacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionCmacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
