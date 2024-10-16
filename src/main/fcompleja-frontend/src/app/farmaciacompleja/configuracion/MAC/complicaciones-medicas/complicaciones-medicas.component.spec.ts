import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplicacionesMedicasComponent } from './complicaciones-medicas.component';

describe('ComplicacionesMedicasComponent', () => {
  let component: ComplicacionesMedicasComponent;
  let fixture: ComponentFixture<ComplicacionesMedicasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplicacionesMedicasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplicacionesMedicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
