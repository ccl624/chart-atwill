import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Bar3DDemoComponent } from './bar3D-demo.component';

describe('Bar3DDemoComponent', () => {
  let component: Bar3DDemoComponent;
  let fixture: ComponentFixture<Bar3DDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bar3DDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Bar3DDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
