import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { RolesResponse } from '../../../core/interfaces/role.model';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserModel } from '../../../core/interfaces/user.model';
import { ActivatedRoute } from '@angular/router';
import { SnackBarService } from '../../../core/services/snack-bar.service';


@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.scss'
})
export class EditUserDialogComponent {
  roles: RolesResponse | undefined;
  editUserForm: FormGroup;
  constructor(
    private http: HttpClient,
    private api: ApiService,
    public theme: ThemeService,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: UserModel,

    
  ) {
    this.editUserForm = new FormGroup({
      f_name: new FormControl(this.user.f_name),
      l_name:new FormControl(this.user.l_name),
      email: new FormControl(this.user.email),
      role_ids: new FormControl(this.user.roles.map((role) => role.id)),
    });
    this.get_roles();
  }

  edit_user() {
    const url = `${this.api.base_uri}users/${this.user.id}/update_details`;
    const formData = this.editUserForm.value;
    this.http
      .post(url, formData, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.dialogRef.close();
            this.editUserForm.reset()
          }
        },
      });
  }

  get_roles() {
    const url = `${this.api.base_uri}roles`;
    this.http
      .get(url, {
        withCredentials: true,
        observe: 'response',
        params: new HttpParams().append('per_page', -1),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.roles = response.body;
        },
      });
  }

  

}
