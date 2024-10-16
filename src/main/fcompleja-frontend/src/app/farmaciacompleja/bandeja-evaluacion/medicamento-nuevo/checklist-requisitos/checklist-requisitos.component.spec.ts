import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistRequisitosComponent } from './checklist-requisitos.component';

describe('ChecklistRequisitosComponent', () => {
  let component: ChecklistRequisitosComponent;
  let fixture: ComponentFixture<ChecklistRequisitosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistRequisitosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistRequisitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
