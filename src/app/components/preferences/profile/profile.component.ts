import { CommonModule } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';
import { UserModel } from '../../../core/interfaces/user.model';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  @Input() user?: UserModel | null;
  constructor(
    public userService: UserService,
    public api: ApiService,
    private dialog: MatDialog,
    public theme: ThemeService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  edit_profile() {
    this.dialog.open(ProfileEditComponent, {
      maxWidth: '900px',
      width: '100%',
      data: this.user,
    });
  }

  enable2Fa() {
    this.http
      .post(
        `${this.api.base_uri}otp/enable`,
        { otp_required_for_login: true, two_factor_code: null },
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok)
            this.snackBar.open(
              'Two-factor authentication has been enabled.',
              'Close',
              {
                duration: 5000,
              }
            );
        },
        error: (err) => {
          this.snackBar.open(
            'Invalid or expired verification code. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
  }
  disable2Fa() {
    this.http
      .post(
        `${this.api.base_uri}otp/disable`,
        {},
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok)
            this.snackBar.open(
              'Two-factor authentication has been disabled.',
              'Close',
              {
                duration: 5000,
              }
            );
        },
        error: (err) => {
          this.snackBar.open(
            'Invalid or expired verification code. Please try again.',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
  }
}
