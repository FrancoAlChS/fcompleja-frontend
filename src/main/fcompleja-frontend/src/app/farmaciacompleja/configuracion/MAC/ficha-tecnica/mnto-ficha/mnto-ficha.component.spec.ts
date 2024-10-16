import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MntoFichaComponent } from './mnto-ficha.component';

describe('MntoFichaComponent', () => {
  let component: MntoFichaComponent;
  let fixture: ComponentFixture<MntoFichaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MntoFichaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MntoFichaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
