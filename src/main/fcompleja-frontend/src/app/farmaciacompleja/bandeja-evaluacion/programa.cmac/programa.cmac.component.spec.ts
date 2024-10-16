import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Programa.CmacComponent } from './programa.cmac.component';

describe('Programa.CmacComponent', () => {
  let component: Programa.CmacComponent;
  let fixture: ComponentFixture<Programa.CmacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Programa.CmacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Programa.CmacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
