import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CometarioComponent } from './cometario.component';

describe('CometarioComponent', () => {
  let component: CometarioComponent;
  let fixture: ComponentFixture<CometarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CometarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CometarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
