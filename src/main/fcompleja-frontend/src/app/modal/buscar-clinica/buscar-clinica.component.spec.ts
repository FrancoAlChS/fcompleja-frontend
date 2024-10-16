import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarClinicaComponent } from './buscar-clinica.component';

describe('BuscarClinicaComponent', () => {
  let component: BuscarClinicaComponent;
  let fixture: ComponentFixture<BuscarClinicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarClinicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
