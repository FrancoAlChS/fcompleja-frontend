import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionLiderTumorComponent } from './evaluacion.lider.tumor.component';

describe('EvaluacionLiderTumorComponent', () => {
  let component: EvaluacionLiderTumorComponent;
  let fixture: ComponentFixture<EvaluacionLiderTumorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluacionLiderTumorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionLiderTumorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
