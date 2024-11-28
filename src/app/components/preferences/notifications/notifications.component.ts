import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
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
export class NotificationsComponent {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService,
    private websocketService: WebSocketService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {

    this.userId = this.userService.user?.id;
          console.log(this.userId);
          
    if (!this.userId) {
      this.userService.user$.subscribe((user) => {
        if (user) {
          this.userId = user.id;
          if (this.userId) {
            this.subscribeToChannels(this.userId);
    this.getNotifications(`${this.api.base_uri}notifications`);
          }
        }
      });
    }

    this.markAsReadSubject
      .pipe(debounceTime(300)) // Debounce for 1 second
      .subscribe(() => {
        if (this.unreadNotificationIds.length > 0) {
          this.websocketService.sendMessage('NotificationChannel', {
            action: 'bulk_read',
            notification_ids: this.unreadNotificationIds,
          });
        }
      });
  }

  notifications: any | undefined;
  displayedColumns: string[] = ['index', 'title', 'body', 'read_at'];
  pageEvent: PageEvent = new PageEvent();
  userId: any;
  private markAsReadSubject = new Subject<void>();
  unreadNotificationIds: string[] = [];

  subscribeToChannels(user_id: string) {
    this.websocketService.subscribeAndListenToChannel(
      'NotificationChannel',
      { user_id: user_id},
      this.handleReadNotifications.bind(this)
    );

    this.cdr.detectChanges();
  }

  getNotifications(url: string, pageEvent?: PageEvent) {
    let params = new HttpParams()
    .set('per_page', pageEvent ? pageEvent.pageSize.toString() : '10')
    .set('page', pageEvent ? (pageEvent.pageIndex + 1).toString() : '1')
    .set('q[s]', 'created_at desc')
    .set('q[recipient_id_eq]', this.userId);
  

    this.http
      .get(url, { params, withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.notifications = response.body;

          this.unreadNotificationIds = this.notifications?.data
            .filter((notification: any) => !notification.read_at) // Get only unread notifications
            .map((notification: any) => notification.id); // Extract their IDs
          this.markAsReadSubject.next();

          if (pageEvent) {
            this.pageEvent = pageEvent;
          }
        },
        complete: () => {},
        error: (err) => {},
      });
  }

  handleReadNotifications() {
    // Update local notifications list and mark them as read
    this.notifications?.data.forEach((notification: any) => {
      notification.read_at = new Date(); // Mark as read locally
    });

    // Update unread notification count
    this.notificationService.updateUnreadCount();
  }

  paginate($event: PageEvent) {
    this.getNotifications(`${this.api.base_uri}notifications`, $event);
  }
}
