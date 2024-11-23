import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbOverviewComponent } from './kb-overview.component';

describe('KbOverviewComponent', () => {
  let component: KbOverviewComponent;
  let fixture: ComponentFixture<KbOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
