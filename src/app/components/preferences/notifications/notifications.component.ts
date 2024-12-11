import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationsResponse, NotificationModel } from '../../../core/interfaces/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationsResponse | null = null;
  displayedColumns: string[] = ['index', 'title', 'body', 'read_at'];
  pageEvent: PageEvent = new PageEvent();
  unreadNotificationIds: string[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  perPage: number = 10;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(page: number = 1, perPage: number = this.perPage): void {
    this.notificationService.getNotifications(page, perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: NotificationsResponse) => {
          this.notifications = response;
          this.totalPages = Math.ceil(response.total / this.perPage);
          this.updateUnreadNotificationIds();
          this.markNotificationsAsRead();
        },
        error: (err) => console.error('Error fetching notifications', err)
      });
  }

  subscribeToNotifications(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        if (notifications) {
          this.notifications = notifications;
          this.updateUnreadNotificationIds();
          this.cdr.detectChanges();
        }
      });

    this.notificationService.newNotifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(newNotifications => {
        if (newNotifications.length > 0) {
          this.loadNotifications(this.currentPage, this.perPage);
        }
      });
  }

  updateUnreadNotificationIds(): void {
    this.unreadNotificationIds = this.notifications?.data
      .filter(notification => !notification.read_at)
      .map(notification => notification.id) || [];
  }

  markNotificationsAsRead(): void {
    if (this.unreadNotificationIds.length > 0) {
      this.notificationService.markNotificationsAsRead(this.unreadNotificationIds)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.updateUnreadNotificationIds();
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Error marking notifications as read:', error)
        });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageEvent = event;
    this.currentPage = event.pageIndex + 1;
    this.perPage = event.pageSize;
    this.loadNotifications(this.currentPage, this.perPage);
  }

  goToFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.notificationService.getNotifications();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.notificationService.getNotifications();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.notificationService.getNotifications();
    }
  }

  goToLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.notificationService.getNotifications();
    }
  }

}
