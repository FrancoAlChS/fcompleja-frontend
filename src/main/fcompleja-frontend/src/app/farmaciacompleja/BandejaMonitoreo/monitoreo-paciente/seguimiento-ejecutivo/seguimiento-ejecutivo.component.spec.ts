import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoEjecutivoComponent } from './seguimiento-ejecutivo.component';

describe('SeguimientoEjecutivoComponent', () => {
  let component: SeguimientoEjecutivoComponent;
  let fixture: ComponentFixture<SeguimientoEjecutivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeguimientoEjecutivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoEjecutivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
