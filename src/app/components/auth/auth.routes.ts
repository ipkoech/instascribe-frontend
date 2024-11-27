import { Routes } from "@angular/router";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { LoginComponent } from "./login/login.component";
import { OtpVerificationComponent } from "./otp-verification/otp-verification.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'otp', component: OtpVerificationComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
