import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from '../../../core/interfaces/user.model';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    EditUserDialogComponent,
    MatDialogModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  @ViewChild('enable2FaDialog') enable2FaDialog!: TemplateRef<any>;
  @ViewChild('disable2FaDialog') disable2FaDialog!: TemplateRef<any>;

  constructor(private activateRoute: ActivatedRoute, private fb: FormBuilder, private http: HttpClient, private api: ApiService,private dialog:MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private snackbarService: SnackBarService

  ) {
    this.activateRoute.data.subscribe(({ user }) => {
      this.user = user;
      if (this.user) {
        this.refresh(user)
      }
    }),
      (this.accountForm = this.fb.group({
        username: [''],
        email: [''],
        firstName: [''],
        lastName: [''],
        job: [''],
        aboutMe: [''],
      }));

  }
  accountForm: FormGroup;

  user: UserModel | undefined;

  profileImageUrl!: string;

  uploadProfileImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile_image', file);
      this.http.post(`${this.api.base_uri}users/${this.user?.id}/profile-image`, formData, { withCredentials: true, observe: 'response' })
        .subscribe((response: HttpResponse<any>) => {
          if(response.ok)
          this.profileImageUrl = response.body.data.profile_image_url;

        });
    }
  }

  refresh(user: UserModel) {
    this.user = user;
  }

  edit_user(user: UserModel) {
    let dialogef = this.dialog.open(EditUserDialogComponent, {
      width: '900px',
      data: user,
      hasBackdrop: true,
    });
    dialogef.afterClosed().subscribe((result) => {
      if(result){
      this.refresh(user);
      }
    });
  }

  disable2Fa(userId: string) {
    this.http
      .post(
        `${this.api.base_uri}otp/disable`,
        {},
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) this.refreshUser();
          this.snackbarService.show(
            'Two-factor authentication has been disabled',
            'success'
          );

          this.cdr.detectChanges();
        },
        complete: () => {},
        error: (err) => {
          this.snackbarService.show(
            'Invalid or expired verification code. Please try again.',
            'error'
          );
        },
      });
  }

  confirmDisable2Fa() {
    this.dialog.closeAll();
    if (this.user) this.disable2Fa(this.user?.id);
  }

  confirmEnable2Fa() {
    this.dialog.closeAll();
    if (this.user) this.enable2Fa(this.user.id);
  }

  refreshUser() {
    this.http
      .get(`${this.api.base_uri}users/${this.user?.id}`, {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.user = response.body;
        },
        error: (error: HttpErrorResponse) => {},
      });
  }

  enable2Fa(userId: string) {
    this.http
      .post(
        `${this.api.base_uri}otp/enable`,
        {},
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) this.refreshUser();
          this.snackbarService.show(
            'Two-factor authentication has been disabled',
            'success'
          );

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.snackbarService.show(
            'Invalid or expired verification code. Please try again.',
            'error'
          );
        },
      });
  }

  openEnable2FaDialog() {
    this.dialog.open(this.enable2FaDialog, {
      hasBackdrop: true,
    });
  }

  openDisable2FaDialog() {
    this.dialog.open(this.disable2FaDialog, {
      hasBackdrop: true,
    });
  }
}
