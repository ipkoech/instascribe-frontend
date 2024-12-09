import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationDetailComponent } from './collaboration-detail.component';

describe('CollaborationDetailComponent', () => {
  let component: CollaborationDetailComponent;
  let fixture: ComponentFixture<CollaborationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaborationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaborationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
