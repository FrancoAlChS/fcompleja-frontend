import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisConclusionComponent } from './analisis-conclusion.component';

describe('AnalisisConclusionComponent', () => {
  let component: AnalisisConclusionComponent;
  let fixture: ComponentFixture<AnalisisConclusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalisisConclusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalisisConclusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
