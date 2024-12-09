import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, debounceTime } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WebSocketService } from '../../../core/services/web-socket.service';

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
export class NotificationsComponent implements AfterViewInit {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService,
    private websocketService: WebSocketService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.userId = this.userService.user?.id;
    if (this.userId) {
      this.subscribeToChannels(this.userId);
      this.getNotifications(`${this.api.base_uri}notifications`);
    } else {
      this.userService.user$.subscribe((user) => {
        if (user) {
          this.userId = user.id;
          this.subscribeToChannels(this.userId);
          this.getNotifications(`${this.api.base_uri}notifications`);
        }
      });
    }

    this.markAsReadSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.markNotificationsAsRead());
  }

  ngAfterViewInit(): void {}

  notifications: any | undefined;
  displayedColumns: string[] = ['index', 'title', 'body', 'read_at'];
  pageEvent: PageEvent = new PageEvent();
  userId: any;
  private markAsReadSubject = new Subject<void>();
  unreadNotificationIds: string[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  perPage: number = 10;

  subscribeToChannels(user_id: string) {
    this.websocketService.subscribeAndListenToChannel(
      'NotificationChannel',
      { user_id: user_id },
      this.handleReadNotifications.bind(this)
    );
  }

  handleReadNotifications() {
    this.notifications?.data.forEach((notification: any) => {
      notification.read_at = new Date();
    });
    this.notificationService.updateUnreadCount();
    this.cdr.detectChanges();
  }

  getNotifications(url: string, pageEvent?: PageEvent) {
    let params = new HttpParams()
      .set('per_page', pageEvent ? pageEvent.pageSize.toString() : this.perPage.toString())
      .set('page', pageEvent ? (pageEvent.pageIndex + 1).toString() : this.currentPage.toString())
      .set('q[s]', 'created_at desc')
      .set('q[recipient_id_eq]', this.userId);

    this.http
      .get(url, { params, withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.notifications = response.body;
          this.totalPages = Math.ceil(this.notifications?.total / this.perPage);
          this.unreadNotificationIds = this.notifications?.data
            .filter((notification: any) => !notification.read_at)
            .map((notification: any) => notification.id);
          this.markAsReadSubject.next(); // Trigger mark as read when notifications are loaded
          if (pageEvent) {
            this.pageEvent = pageEvent;
          }
        },
        error: (err) => {
          console.error('Error fetching notifications', err);
        },
      });
  }

  markNotificationsAsRead() {
    if (this.unreadNotificationIds.length > 0) {
      this.websocketService.sendMessage('NotificationChannel', {
        action: 'bulk_read',
        notification_ids: this.unreadNotificationIds,
      });
      // Optionally update the local list to reflect read status
      this.notifications?.data.forEach((notification: any) => {
        if (this.unreadNotificationIds.includes(notification.id)) {
          notification.read_at = new Date();
        }
      });
      this.notificationService.updateUnreadCount();
      this.cdr.detectChanges();
    }
  }

  paginate(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.perPage = event.pageSize;
    this.getNotifications(`${this.api.base_uri}notifications`, event);
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.getNotifications(`${this.api.base_uri}notifications`);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getNotifications(`${this.api.base_uri}notifications`);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getNotifications(`${this.api.base_uri}notifications`);
    }
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
    this.getNotifications(`${this.api.base_uri}notifications`);
  }
}
