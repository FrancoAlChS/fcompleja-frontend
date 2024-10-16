import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarComiteComponent } from './registrar-comite.component';

describe('RegistrarComiteComponent', () => {
  let component: RegistrarComiteComponent;
  let fixture: ComponentFixture<RegistrarComiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarComiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarComiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
