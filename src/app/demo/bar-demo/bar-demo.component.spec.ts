import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarDemoComponent } from './bar-demo.component';

describe('BarDemoComponent', () => {
  let component: BarDemoComponent;
  let fixture: ComponentFixture<BarDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
