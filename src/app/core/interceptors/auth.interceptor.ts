import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../services/api.service';

export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const api = inject(ApiService);
  const router = inject(Router);
  const token = getCookie('access_token');


  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const authHeader = event.headers.get('Authorization');
          if (authHeader) {
            const newToken = authHeader.split(' ')[1];
            setCookie('access_token', newToken);
          }
        }
      },
      error: (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            deleteCookie('access_token');
            const currentUrl = window.location.pathname;
            if (!['/auth/login', '/register', '/forgot', '/reset'].includes(currentUrl)) {
              window.location.href = `${api.client_uri}auth/login?redirect_to=${window.location.origin}${router.url}`;
            }
          }
          if (err.status === 403 && err.error['code'] === 'OTP_REQUIRED') {
            router.navigate(['/two-factor-authentication'], { queryParamsHandling: 'merge' });
          }
        }
      }
    })
  );
};

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

