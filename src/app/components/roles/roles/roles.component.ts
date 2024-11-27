import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsResponse } from '../../../core/interfaces/permission.model';
import { RolesResponse } from '../../../core/interfaces/role.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {

  roles: RolesResponse | undefined;
  permissions: PermissionsResponse | undefined;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private snack: MatSnackBar,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.get_roles(`${this.api.base_uri}roles`);
  }

  get_roles(url: string) {
    this.http
      .get(url, {
        observe: 'response',
        withCredentials: true,
        params: new HttpParams()
          .append('per_page', -1)
          .append('order_by', 'created_at desc')
          .append('include', 'permissions'),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.roles = response.body;
          this.cdr.detectChanges();
        },
      });
  }

}
