import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';
  isReseting: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbar: SnackBarService,
    private http: HttpClient
  ) {
    // Form initialization
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Extract token from query parameters
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }

  // Custom Validator for Password Match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isReseting = true;
    this.successMessage = null;
    this.errorMessage = null;

    const payload = {
      token: this.token,
      password: this.resetPasswordForm.get('password')?.value,
      password_confirmation: this.resetPasswordForm.get('password_confirmation')
        ?.value,
    };

    this.http
      .post(`${this.authService.base_uri}/reset`, payload, {
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.successMessage =
              'Password reset successfully. Redirecting to login...';
            setTimeout(() => this.router.navigate(['/auth/login']), 3000);
          }
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Failed to reset the password. Please try again.';
          this.isReseting = false;
        },
        complete: () => {
          this.isReseting = false;
        },
      });
  }
}
