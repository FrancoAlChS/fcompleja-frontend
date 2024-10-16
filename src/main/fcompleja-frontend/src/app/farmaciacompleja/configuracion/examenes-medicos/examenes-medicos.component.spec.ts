import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenesMedicosComponent } from './examenes-medicos.component';

describe('ExamenesMedicosComponent', () => {
  let component: ExamenesMedicosComponent;
  let fixture: ComponentFixture<ExamenesMedicosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamenesMedicosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamenesMedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
