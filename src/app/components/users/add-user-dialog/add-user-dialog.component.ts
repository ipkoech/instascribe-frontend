import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient, HttpResponse, HttpParams, HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RolesResponse } from '../../../core/interfaces/role.model';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserModelsResponse } from '../../../core/interfaces/user.model';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent {
  roles: RolesResponse | undefined;
  users?: UserModelsResponse | null = null;

  addUserForm = new FormGroup({
    f_name: new FormControl(),
    l_name: new FormControl(),
    email: new FormControl(),
    role_ids: new FormControl([]),
  });

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private dialogef: MatDialogRef<AddUserDialogComponent>,
    public theme: ThemeService
  ) {
    this.get_roles();
    this.get_users(`${this.api.base_uri}users`);
  }

  add_user() {
    const url = `${this.api.base_uri}users`;
    const users = this.addUserForm.value;
    this.http
      .post(
        url,
        { users: [users] },
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.dialogef.close();
          }
        }, error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status === 422 && errorResponse.error) {
            const backendErrors = errorResponse.error[0].errors;
            console.log(backendErrors);

            backendErrors.forEach((error: string) => {
              if (error.includes("Name can't be blank")) {
                this.addUserForm.controls.f_name.setErrors({ backend: ["Name can't be blank"] });
              }
              if (error.includes("Email can't be blank")) {
                this.addUserForm.controls.email.setErrors({ backend: ["Email can't be blank"] });
              }
            });
          }
        }
      });
  }

  get_roles() {
    const url = `${this.api.base_uri}roles`;
    this.http
      .get(url, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.roles = response.body;
        },
      });
  }

  get_users(url: string) {
    this.http
      .get<UserModelsResponse>(url, {
        observe: 'response',
        params: new HttpParams()
          .append('per_page', 5)
          .append('order_by', 'created_at desc')
          .append('include', 'roles'),
      })
      .subscribe({
        next: (response: HttpResponse<UserModelsResponse>) => {
          this.users = response.body;
        },
      });
  }
}
