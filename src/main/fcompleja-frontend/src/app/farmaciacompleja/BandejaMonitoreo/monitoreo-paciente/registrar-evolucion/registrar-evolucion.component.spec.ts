import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEvolucionComponent } from './registrar-evolucion.component';

describe('RegistrarEvolucionComponent', () => {
  let component: RegistrarEvolucionComponent;
  let fixture: ComponentFixture<RegistrarEvolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarEvolucionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarEvolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
