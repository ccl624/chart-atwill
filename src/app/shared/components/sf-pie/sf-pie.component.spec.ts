import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfPieComponent } from './sf-pie.component';

describe('SfPieComponent', () => {
  let component: SfPieComponent;
  let fixture: ComponentFixture<SfPieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
