import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcadoresModalComponent } from './marcadores-modal.component';

describe('MarcadoresModalComponent', () => {
  let component: MarcadoresModalComponent;
  let fixture: ComponentFixture<MarcadoresModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarcadoresModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcadoresModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
