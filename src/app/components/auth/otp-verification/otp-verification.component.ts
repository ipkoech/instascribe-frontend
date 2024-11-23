import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss'
})
export class OtpVerificationComponent {

  otpControls = Array(4).fill(0);
  remainingTime = 30;
  private resendTimer: any;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackbar: SnackBarService
  ) {
    this.startResendTimer();

  this.otpForm = this.fb.group({
    digit0: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
  });

  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && index < 3) {
      const nextInput = document.querySelector(
        `input[formcontrolname=digit${index + 1}]`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && index > 0 && !this.otpForm.get(`digit${index}`)?.value) {
      const prevInput = document.querySelector(
        `input[formcontrolname=digit${index - 1}]`
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  startResendTimer(): void {
    this.remainingTime = 30;
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    this.resendTimer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  resendOtp(): void {
    this.snackbar.info('Sending new OTP...');
    // Implement resend OTP logic here
    this.startResendTimer();
    this.snackbar.success('New OTP has been sent');
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      const otp = Object.values(this.otpForm.value).join('');

      this.snackbar.info('Verifying OTP...');
      // this.authService.verifyOtp(otp)
      //   .subscribe({
      //     next: () => {
      //       this.snackbar.success('OTP verified successfully');
      //       this.router.navigate(['/users']);
      //     },
      //     error: () => {
      //       this.snackbar.error('Invalid OTP');
      //       this.otpForm.reset();
      //     }
      //   });
    }
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }
}
