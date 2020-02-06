import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfProgressComponent } from './sf-progress.component';

describe('SfProgressComponent', () => {
  let component: SfProgressComponent;
  let fixture: ComponentFixture<SfProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
