import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000, horizontalPosition: MatSnackBarHorizontalPosition = 'end', verticalPosition: MatSnackBarVerticalPosition = 'top'): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition,
      verticalPosition
    });
  }

  error(message: string, duration: number = 5000, horizontalPosition: MatSnackBarHorizontalPosition = 'end', verticalPosition: MatSnackBarVerticalPosition = 'top'): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition,
      verticalPosition
    });
  }

  info(message: string, duration: number = 3000, horizontalPosition: MatSnackBarHorizontalPosition = 'end', verticalPosition: MatSnackBarVerticalPosition = 'top'): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition,
      verticalPosition
    });
  }

  warning(message: string, duration: number = 3000, horizontalPosition: MatSnackBarHorizontalPosition = 'end', verticalPosition: MatSnackBarVerticalPosition = 'top'): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition,
      verticalPosition
    });
  }

  private snackbarSubject = new BehaviorSubject<{ message: string; type: string } | null>(null);
  snackbarState$ = this.snackbarSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.snackbarSubject.next({ message, type });
    
    // Automatically hide the snackbar after 3 seconds
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    this.snackbarSubject.next(null);
  }
}
