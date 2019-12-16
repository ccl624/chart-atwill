import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieDemoComponent } from './pie-demo.component';

describe('PieDemoComponent', () => {
  let component: PieDemoComponent;
  let fixture: ComponentFixture<PieDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
