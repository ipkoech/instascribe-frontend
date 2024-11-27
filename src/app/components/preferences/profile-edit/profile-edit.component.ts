import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent {
  user_form = new FormGroup({
    email: new FormControl(),
    name: new FormControl<any>({ value: '', disabled: true }),
  });
  constructor(
    public userService: UserService,
    private dialogRef: MatDialogRef<ProfileEditComponent>,
    private http: HttpClient,
    public api: ApiService,
    public theme: ThemeService
  ) {
    this.user_form.controls.name.setValue(this.userService.user?.f_name);
    this.user_form.controls.email.setValue(this.userService.user?.email);
    this.user_form.controls.email.valueChanges
      .pipe(debounceTime(800))
      .subscribe((value) => {
        this.http
          .patch(
            `${this.api.base_uri}users/${this.userService.user?.id}`,
            { email: this.user_form.controls.email.value },
            { observe: 'response' }
          )
          .subscribe({
            next: (response: HttpResponse<any>) => {},
          });
      });
  }
}
