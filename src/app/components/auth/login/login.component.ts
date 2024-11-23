import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserService } from '../../../core/services/user.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup
  hidePassword = true;
  redirect_to?: null | string;
  general_form_error: string | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbar: SnackBarService,
    public userService: UserService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private api: ApiService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.route.queryParamMap.subscribe({
      next: (paramMap) => {
        this.redirect_to = paramMap.get('redirect_to');
      },
    });

    if (this.userService.user) {
      this.redirect_to
        ? (window.location.href = this.redirect_to)
        : this.router.navigate(['/']);
    } else {
      this.userService.user$.subscribe({
        next: (user) => {
          if (user) {
            this.snackbar.success(`Logged in as ${user.f_name}`);
            this.redirect_to
              ? (window.location.href = this.redirect_to)
              : this.router.navigate(['/']);
          }
        },
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loginForm.disable({ emitEvent: false });
      this.http
        .post(`${this.api.base_uri}login`, this.loginForm.value, {
          observe: 'response',
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
        .subscribe({
          next: (response: HttpResponse<any>) => {
            this.userService.get_user();
            // Perform actions on successful login
            this.loginForm.enable({ emitEvent: false });
          },
          error: (errorResponse: HttpErrorResponse) => {
            this.loginForm.enable({ emitEvent: false });

            switch (errorResponse.status) {
              case 401:
                if (errorResponse.error['error']) {
                  if (errorResponse['error'].error) {
                    this.general_form_error = errorResponse['error'].error;
                  }
                }
                break;
              case 422:
                if (errorResponse.error['errors']) {
                  if (errorResponse.error['errors'].email) {
                    this.loginForm.controls['email'].setErrors({
                      backend: errorResponse.error['errors'].email,
                    });
                  }
                  if (errorResponse.error['errors'].password) {
                    this.loginForm.controls['password'].setErrors({
                      backend: errorResponse.error['errors'].password,
                    });
                  }
                }
                break;
              default:
                break;
            }
          },
        });
    }
  }
}
