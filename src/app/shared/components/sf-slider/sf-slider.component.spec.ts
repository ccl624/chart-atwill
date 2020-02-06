import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfSliderComponent } from './sf-slider.component';

describe('SfSliderComponent', () => {
  let component: SfSliderComponent;
  let fixture: ComponentFixture<SfSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
