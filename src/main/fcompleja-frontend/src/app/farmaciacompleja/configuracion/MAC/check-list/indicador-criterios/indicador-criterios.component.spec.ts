import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorCriteriosComponent } from './indicador-criterios.component';

describe('IndicadorCriteriosComponent', () => {
  let component: IndicadorCriteriosComponent;
  let fixture: ComponentFixture<IndicadorCriteriosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicadorCriteriosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorCriteriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
