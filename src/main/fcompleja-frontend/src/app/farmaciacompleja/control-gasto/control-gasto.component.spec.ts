import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlGastoComponent } from './control-gasto.component';

describe('ControlGastoComponent', () => {
  let component: ControlGastoComponent;
  let fixture: ComponentFixture<ControlGastoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlGastoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
