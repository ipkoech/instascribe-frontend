import { HttpClient, HttpParams, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { WebSocketService } from './web-socket.service';
import { NotificationsResponse, NotificationModel } from '../interfaces/notification.model';
import { UserModel } from '../interfaces/user.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _notifications$ = new BehaviorSubject<NotificationsResponse | null>(null);
  notifications$ = this._notifications$.asObservable();

  private _newNotifications$ = new BehaviorSubject<NotificationModel[]>([]);
  newNotifications$ = this._newNotifications$.asObservable();

  private _unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount$.asObservable();

  // Optional: Track connection status to NotificationChannel
  private _connectionStatus$ = new BehaviorSubject<string>('disconnected');
  connectionStatus$ = this._connectionStatus$.asObservable();

  private user: UserModel | undefined;

  constructor(
    private userService: UserService,
    private websocketService: WebSocketService,
    private http: HttpClient,
    private api: ApiService
  ) {
    this.userService.user$
      .pipe(
        tap((user) => {
          if (user) {
            this.user = user;
            // Load initial notifications
            this.getNotifications().subscribe();
            // Subscribe to the user's NotificationChannel
            this.subscribeToNotifications(user.id);
          } else {
            // User logged out, unsubscribe and clear state
            this.unsubscribeFromNotifications();
            this._notifications$.next(null);
            this._newNotifications$.next([]);
            this._unreadCount$.next(0);
            this._connectionStatus$.next('disconnected');
          }
        })
      )
      .subscribe();
  }

  private subscribeToNotifications(userId: string) {
    this.websocketService.subscribeAndListenToChannel(
      'NotificationChannel',
      { user_id: userId },
      (data: any) => {
        switch (data.action) {
          case 'connection_status':
            this.handleConnectionStatus(data.status);
            break;
          case 'error':
            this.handleError(data.message);
            break;
          case 'bulk_read':
            this.handleBulkRead(data.notification_ids);
            break;
          case 'create':
            this.handleCreateNotification(data.notification);
            break;
          case 'update':
            this.handleUpdateNotification(data.notification);
            break;
          default:
            console.warn('Unknown notification action:', data.action);
        }
      }
    );
  }

  private unsubscribeFromNotifications() {
    this.websocketService.unsubscribeFromChannel('NotificationChannel');
  }

  private handleCreateNotification(notification: NotificationModel) {
    // Update the main list if it exists
    const currentList = this._notifications$.getValue();
    if (currentList) {
      // Check if notification already exists
      const exists = currentList.data.some(n => n.id === notification.id);
      if (!exists) {
        const updatedList = { ...currentList, data: [notification, ...currentList.data] };
        this._notifications$.next(updatedList);
        // Only increment count if notification is new
        this.incrementUnreadCount();
      }
    } else {
      // If no list exists, initialize with the new notification
      this._notifications$.next({ data: [notification] } as NotificationsResponse);
      this.incrementUnreadCount();
    }

    // Update new notifications array
    const currentNew = this._newNotifications$.getValue();
    const newExists = currentNew.some(n => n.id === notification.id);
    if (!newExists) {
      this._newNotifications$.next([...currentNew, notification]);
    }
  }


  private handleUpdateNotification(notification: NotificationModel) {
    // Update new notifications array
    const currentNew = this._newNotifications$.getValue();
    const updatedNew = currentNew.map(n => n.id === notification.id ? notification : n);
    this._newNotifications$.next(updatedNew);

    // Update main notifications list
    const currentList = this._notifications$.getValue();
    if (currentList) {
      const updatedList = {
        ...currentList,
        data: currentList.data.map(n => n.id === notification.id ? notification : n)
      };
      this._notifications$.next(updatedList);
    }

    // Recalculate unread count
    this.updateUnreadCountFromNotifications();
  }

  private handleBulkRead(notificationIds: string[]) {
    if (notificationIds.length === 0) return;

    const currentList = this._notifications$.getValue();
    if (currentList) {
      const updatedList = {
        ...currentList,
        data: currentList.data.map(notification =>
          notificationIds.includes(notification.id) ? { ...notification, read_at: new Date() } : notification
        )
      };
      this._notifications$.next(updatedList);
    }

    this.updateUnreadCountFromNotifications();
  }

  private handleConnectionStatus(status: string) {
    this._connectionStatus$.next(status);
    console.log(`Notification channel connection status: ${status}`);
    // e.g. Show a UI indicator if desired
  }

  private handleError(message: string) {
    console.error(`Notification error: ${message}`);
    // e.g. Display a toast/snackbar to the user
  }

  getNotifications(page: number = 1, perPage: number = 20): Observable<NotificationsResponse> {
    const url = `${this.api.base_uri}notifications`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('order_by', 'created_at desc');

    return this.http.get<NotificationsResponse>(url, {
      params,
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      })
    }).pipe(
      tap((response: NotificationsResponse) => {
        this._notifications$.next(response);
        this.updateUnreadCountFromNotifications();
      })
    );
  }

  markNotificationsAsRead(notificationIds: string[]): Observable<any> {
    const url = `${this.api.base_uri}notifications/mark-all-read`;
    return this.http.post(url, { notification_ids: notificationIds }, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      })
    }).pipe(
      tap(() => {
        // Manually update the UI since server also broadcasts a bulk_read action
        this.handleBulkRead(notificationIds);
      })
    );
  }

  private updateUnreadCountFromNotifications() {
    const notifications = this._notifications$.getValue();
    if (notifications) {
      const unreadCount = notifications.data.filter(n => !n.read_at).length;
      this._unreadCount$.next(unreadCount);
    } else {
      this._unreadCount$.next(0);
    }
  }

  private incrementUnreadCount(increment: number = 1) {
    const currentCount = this._unreadCount$.getValue();
    this._unreadCount$.next(currentCount + increment);
  }

  paginate(event: PageEvent) {
    this.getNotifications(event.pageIndex + 1, event.pageSize).subscribe();
  }
}
