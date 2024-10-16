import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaEvaluacionComponent } from './bandeja-evaluacion.component';

describe('BandejaEvaluacionComponent', () => {
  let component: BandejaEvaluacionComponent;
  let fixture: ComponentFixture<BandejaEvaluacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BandejaEvaluacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
