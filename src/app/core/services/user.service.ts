import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, tap, switchMap } from 'rxjs';
import { UserModel } from '../interfaces/user.model';
import { ApiService } from './api.service';
import { WebsocketsService } from './websockets.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user$ = new BehaviorSubject<UserModel | undefined>(undefined);
  private _onlineUsers$ = new BehaviorSubject<UserModel[]>([]);
  user$ = this._user$.asObservable();
  onlineUsers$ = this._onlineUsers$.asObservable();

  user_channel?: ActionCable.Channel;
  user: UserModel | undefined;

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private snack: MatSnackBar,
    private websocketService: WebsocketsService
  ) {
    this.user$
      .pipe(
        tap((user) => {
          if (user) {
            this.user = user;
            this.subscribeToUserChannel(user);
            this.subscribeToPresenceChannel();
          }
        })
      )
      .subscribe();
    this.get_user();
  }

  private subscribeToUserChannel(user: UserModel) {
    this.websocketService.subscribeAndListenToChannel(
      'UserChannel',
      { user_id: user.id },
      (data) => {
        const updatedUser = data?.['user'];
        if (updatedUser) {
          this._user$.next(updatedUser);
        }
      }
    );
  }

  private subscribeToPresenceChannel() {
    this.websocketService.subscribeAndListenToChannel(
      'UserPresenceChannel',
      {},
      (data) => {
        const onlineUsers = this._onlineUsers$.getValue();
        if (data.status === 'online') {
          // Add user if not already in the list
          if (!onlineUsers.find((user) => user.id === data.user?.id)) {
            this._onlineUsers$.next([...onlineUsers, data.user]);
          }
        } else {
          // Remove user if they went offline or away
          this._onlineUsers$.next(
            onlineUsers.filter((user) => user.id !== data.user?.id)
          );
        }
      }
    );
  }

  get_user() {
    this.http
      .get(`${this.api.base_uri_api}users/current`, {
        observe: 'response',
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
      .pipe(
        tap((response: HttpResponse<any>) => {
          const user = response.body as UserModel;
          this._user$.next(user);
        }),
        switchMap(() => this.user$) // Use switchMap to handle subscription logic
      )
      .subscribe();
  }

  logout() {
    this.http
      .delete(`${this.api.base_uri_api}logout`, {
        observe: 'response',
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this._user$.next(undefined);
          this.snack.open('Logged out.', '', { duration: 3000 });
        },
        complete: () => {
          this.get_user();
        },
      });
  }

  get(id: string) {
    return this.http.get<any>(this.api.base_uri_api + `users/${id}`, {
      withCredentials: true,
      observe: 'body',
    });
  }
}

export const userResolver: ResolveFn<UserModel> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(UserService).get(route.paramMap.get('id')!);
};
