import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternativasConstitucionalesComponent } from './alternativas-constitucionales.component';

describe('AlternativasConstitucionalesComponent', () => {
  let component: AlternativasConstitucionalesComponent;
  let fixture: ComponentFixture<AlternativasConstitucionalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlternativasConstitucionalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlternativasConstitucionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
