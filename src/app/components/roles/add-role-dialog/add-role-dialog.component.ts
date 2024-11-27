import { ChangeDetectorRef, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { PermissionsResponse } from '../../../core/interfaces/permission.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-add-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-role-dialog.component.html',
  styleUrl: './add-role-dialog.component.scss',
})
export class AddRoleDialogComponent {
  roleForm = new FormGroup({
    name: new FormControl(),
    description: new FormControl(),
    permission_ids: new FormControl([]),
  });
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddRoleDialogComponent>
  ) {
    this.get_permissions(`${this.api.base_uri}permissions`);
  }

  permissions: PermissionsResponse | undefined;
  on_submit() {
    const url = `${this.api.base_uri}roles`;
    const formData = this.roleForm.value;
    this.http
      .post(url, formData, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.dialogRef.close();
          }
        },
      });
  }

  get_permissions(url: string) {
    this.http
      .get(url, {
        observe: 'response',
        params: new HttpParams()
          .append('per_page', -1)
          .append('order_by', 'created_at desc'),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.permissions = response.body;
          this.cdr.detectChanges();
        },
      });
  }
}
