import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ResolveFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ApiService } from './api.service';
import { Alert } from '../interfaces/alert.interface';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private http: HttpClient, private api: ApiService) {}
  get(id: string) {
    return this.http.get<any>(this.api.base_uri + `alerts/${id}`, {
      withCredentials: true,
      observe: 'body',
    });
  }
}
export const alertResolver: ResolveFn<Alert> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AlertService).get(route.paramMap.get('alert')!);
};
