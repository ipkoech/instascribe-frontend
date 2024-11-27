import { Component } from '@angular/core';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule} from '@angular/forms';import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [

    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: SnackBarService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;

      this.snackbar.info('Sending reset instructions...');
      // this.authService.requestPasswordReset(email!)
      //   .subscribe({
      //     next: () => {
      //       this.notification.success('Reset instructions sent to your email');
      //       this.forgotPasswordForm.reset();
      //     },
      //     error: () => {
      //       this.notification.error('Failed to send reset instructions');
      //     }
      //   });
    }
  }
}
