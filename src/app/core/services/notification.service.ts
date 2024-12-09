import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { WebSocketService } from './web-socket.service';
import { NotificationsResponse } from '../interfaces/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  new_notifications: Notification[] = [];
  notifications?: NotificationsResponse | null = null;
  unreadCount: number = 0; // Unread notification count
  private isSubscribed = false; // Ensure single subscription to WebSocket

  constructor(
    private userService: UserService,
    private websocketService: WebSocketService,
    private http: HttpClient,
    private api: ApiService
  ) {
    this.initializeWebSocketSubscription();
    this.get_notifications(`${this.api.base_uri}notifications`);
  }

  // Initialize WebSocket subscription for receiving new notifications
  public initializeWebSocketSubscription() {
    if (this.isSubscribed) return; // Ensure subscription happens only once

    const subscribeToChannel = (userId: string) => {
      this.websocketService.subscribeAndListenToChannel(
        'NotificationChannel',
        { user_id: userId },
        (data) => {
          if (data.action === 'bulk_read') {
            this.handleBulkRead(data.notification_ids); // Handle the bulk read action
          } else {
            // Handle individual notification updates
            this.new_notifications.push(data['notification']);
            this.unreadCount++; // Increment unread count when a new notification is received
          }
          if(data.action ==='create'){
            console.log('Created');
            
            this.handleCreateNotification(data.notification);
          }
          if(data.action === 'update'){
            this.handleCreateNotification(data.notification);
          }
        } 
      );
    };

    if (this.userService.user) {
      subscribeToChannel(this.userService.user.id);
      this.isSubscribed = true; // Mark as subscribed
    } else {
      this.userService.user$.subscribe((user) => {
        if (user) {
          subscribeToChannel(user.id);
          this.isSubscribed = true; // Mark as subscribed
        }
      });
    }
  }

  handleCreateNotification(notification: Notification) {
    this.new_notifications.push(notification);
    console.log(notification);
    
    this.unreadCount++; // Increment unread count when a new notification is received
  }

  // Fetch notifications and update unread count
  get_notifications(url: string) {
    this.http
      .get<NotificationsResponse>(url, {
        observe: 'response',
        withCredentials: true,
        params: new HttpParams()
          .append('per_page', '5')
          .append('order_by', 'created_at desc')
          .append('q[read_at_null]', '1'), // Fetch only unread notifications
      })
      .subscribe({
        next: (response: HttpResponse<NotificationsResponse>) => {
          this.notifications = response.body;
          this.updateUnreadCount(); // Update unread count based on the received notifications
        },
        error: (err) => {
          console.error('Failed to fetch notifications:', err);
        },
      });
  }

  // Update unread count based on notifications fetched from the API
  updateUnreadCount() {
    this.unreadCount =
      this.notifications?.data.filter((n) => !n.read_at).length || 0;
  }

  // Mark notifications as read based on notification IDs
  handleBulkRead(notificationIds: string[]) {
    if (notificationIds.length === 0) return;

    this.notifications?.data.forEach((notification) => {
      if (notificationIds.includes(notification.id)) {
        notification.read_at = new Date(); // Mark notification as read
      }
    });

    this.updateUnreadCount(); // Update unread count after marking notifications as read
  }

  // Paginate through notifications
  paginate($event: PageEvent) {
    this.get_notifications(
      `${this.api.base_uri}notifications?page=${$event.pageIndex + 1}`
    );
  }
}
