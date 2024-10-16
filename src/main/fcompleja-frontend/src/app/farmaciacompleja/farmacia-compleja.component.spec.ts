import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmaciaComplejaComponent } from './farmacia-compleja.component';

describe('FarmaciaComplejaComponent', () => {
  let component: FarmaciaComplejaComponent;
  let fixture: ComponentFixture<FarmaciaComplejaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmaciaComplejaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmaciaComplejaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
