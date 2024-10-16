import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaTratamientoModalComponent } from './linea-tratamiento-modal.component';

describe('LineaTratamientoModalComponent', () => {
  let component: LineaTratamientoModalComponent;
  let fixture: ComponentFixture<LineaTratamientoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineaTratamientoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineaTratamientoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
