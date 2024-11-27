import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationAlertDetailComponent } from './notification-alert-detail.component';

describe('NotificationAlertDetailComponent', () => {
  let component: NotificationAlertDetailComponent;
  let fixture: ComponentFixture<NotificationAlertDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationAlertDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationAlertDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
