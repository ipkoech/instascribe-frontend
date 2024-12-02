import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  base_uri = environment.base_uri;

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router
  ) {
    const token = getCookie('access_token');
    if (token) {
      this.currentUserSubject.next({ token });
    }
  }

  isAuthenticated(): boolean {
    return !!getCookie('access_token');
  }

  getToken(): string | null {
    return getCookie('access_token');
  }
}

// Cookie management functions
const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift()!;
  return '';
};

const setCookie = (name: string, value: string): void => {
  document.cookie = `${name}=${value}; path=/; Secure; SameSite=Strict`;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`;
};
