import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionBasalComponent } from './condicion-basal.component';

describe('CondicionBasalComponent', () => {
  let component: CondicionBasalComponent;
  let fixture: ComponentFixture<CondicionBasalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CondicionBasalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CondicionBasalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
