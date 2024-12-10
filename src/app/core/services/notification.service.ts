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
            this.getNotifications();
            this.subscribeToNotifications(user.id);
          } else {
            this.unsubscribeFromNotifications();
          }
        })
      )
      .subscribe();
  }

  private subscribeToNotifications(userId: string) {
    this.websocketService.subscribeAndListenToChannel(
      'NotificationChannel',
      { user_id: userId },
      (data) => {
        if (data.action === 'bulk_read') {
          this.handleBulkRead(data.notification_ids);
        } else if (data.action === 'create') {
          this.handleCreateNotification(data.notification);
        } else if (data.action === 'update') {
          this.handleUpdateNotification(data.notification);
        }
      }
    );
  }

  private unsubscribeFromNotifications() {
    this.websocketService.unsubscribeFromChannel('NotificationChannel');
  }

  private handleCreateNotification(notification: NotificationModel) {
    const currentNotifications = this._newNotifications$.getValue();
    this._newNotifications$.next([...currentNotifications, notification]);
    this.incrementUnreadCount();
  }

  private handleUpdateNotification(notification: NotificationModel) {
    const currentNotifications = this._newNotifications$.getValue();
    const updatedNotifications = currentNotifications.map(n =>
      n.id === notification.id ? notification : n
    );
    this._newNotifications$.next(updatedNotifications);
    this.updateUnreadCountFromNotifications();
  }

  private handleBulkRead(notificationIds: string[]) {
    if (notificationIds.length === 0) return;

    const currentNotifications = this._notifications$.getValue();
    if (currentNotifications) {
      const updatedNotifications = {
        ...currentNotifications,
        data: currentNotifications.data.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, read_at: new Date() }
            : notification
        )
      };
      this._notifications$.next(updatedNotifications as NotificationsResponse);
    }

    this.updateUnreadCountFromNotifications();
  }

  getNotifications(page: number = 1, perPage: number = 20) {
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
        this.handleBulkRead(notificationIds);
      })
    );
  }

  private updateUnreadCountFromNotifications() {
    const notifications = this._notifications$.getValue();
    if (notifications) {
      const unreadCount = notifications.data.filter(n => !n.read_at).length;
      this._unreadCount$.next(unreadCount);
    }
  }

  private incrementUnreadCount(increment: number = 1) {
    const currentCount = this._unreadCount$.getValue();
    this._unreadCount$.next(currentCount + increment);
  }

  paginate(event: PageEvent) {
    this.getNotifications(event.pageIndex + 1, event.pageSize);
  }
}
