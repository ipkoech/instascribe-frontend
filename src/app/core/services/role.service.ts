import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from './api.service';
import { RoleModel } from '../interfaces/role.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient, private api: ApiService) {
  }
  get(id: string) {
    return this.http.get<any>(this.api.base_uri_api + `roles/${id}`, { withCredentials: true, observe: 'body' })
  }


  fetchRoles(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.append(key, params[key]);
    });
    return this.http.get(`${this.api.base_uri}roles`, { params: httpParams, withCredentials: true, observe: 'response' });
  }

  fetchRole(id: string): Observable<any> {
    return this.http.get(`${this.api.base_uri}roles/${id}`, { withCredentials: true, observe: 'response' });
  }

  createRole(role: any): Observable<any> {
    return this.http.post(`${this.api.base_uri}roles`, role, { withCredentials: true, observe: 'response' });
  }

  updateRole(id: string, role: any): Observable<any> {
    return this.http.put(`${this.api.base_uri}roles/${id}`, role, { withCredentials: true, observe: 'response' });
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.api.base_uri}roles/${id}`, { withCredentials: true, observe: 'response' });
  }

  addPermissions(roleId: string, permissionIds: string[]): Observable<any> {
    return this.http.post(`${this.api.base_uri}roles/${roleId}/attach-permissions`, {
      permission_ids: permissionIds
    }, { withCredentials: true, observe: 'response' });
  }

  removePermissions(roleId: string, permissionIds: string[]): Observable<any> {
    return this.http.delete(`${this.api.base_uri}roles/${roleId}/revoke-permissions`, {
      body: { permission_ids: permissionIds },
      withCredentials: true,
      observe: 'response'
    });
  }

  addUsers(roleId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.api.base_uri}roles/${roleId}/attach-users`, {
      user_ids: userIds
    }, { withCredentials: true, observe: 'response' });
  }

  removeUsers(roleId: string, userIds: string[]): Observable<any> {
    return this.http.delete(`${this.api.base_uri}roles/${roleId}/revoke-users`, {
      body: { user_ids: userIds },
      withCredentials: true,
      observe: 'response'
    });
  }

}
export const roleResolver: ResolveFn<RoleModel> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(RoleService).get(route.paramMap.get('role')!);
  }

