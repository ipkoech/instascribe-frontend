import { Component } from '@angular/core';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: SnackBarService,
    private api: ApiService,
    private http: HttpClient,
    private snack: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true; // Show loader

    this.http
      .post(`${this.api.base_uri}forgot`, this.forgotPasswordForm.value, {
        observe: 'response',
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.isLoading = false; // Hide loader
          if (response.ok) {
            this.snack.open(`${response.body['message']}`, '', {
              duration: 4000,
            });
            this.forgotPasswordForm.reset();
          }
        },
        error: (error) => {
          this.isLoading = false; // Hide loader
          const serverErrors = error.error?.errors;
          if (serverErrors?.email) {
            // Set server error message to the email form control
            this.forgotPasswordForm.get('email')?.setErrors({
              serverError: serverErrors.email.join(', '),
            });
          } else {
            // Show a general error message
            this.snack.open(
              'An unexpected error occurred. Please try again.',
              '',
              {
                duration: 4000,
              }
            );
          }
        },
      });
  }
}
