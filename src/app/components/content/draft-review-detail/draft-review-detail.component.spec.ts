import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftReviewDetailComponent } from './draft-review-detail.component';

describe('DraftReviewDetailComponent', () => {
  let component: DraftReviewDetailComponent;
  let fixture: ComponentFixture<DraftReviewDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftReviewDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftReviewDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
