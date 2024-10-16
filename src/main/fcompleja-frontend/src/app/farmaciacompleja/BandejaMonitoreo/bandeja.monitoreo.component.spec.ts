import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaMonitoreoComponent } from './bandeja.monitoreo.component';

describe('BandejaMonitoreoComponent', () => {
  let component: BandejaMonitoreoComponent;
  let fixture: ComponentFixture<BandejaMonitoreoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BandejaMonitoreoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaMonitoreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
