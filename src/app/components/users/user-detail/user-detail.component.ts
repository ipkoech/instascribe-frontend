import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from '../../../core/interfaces/user.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {

  constructor(private activateRoute: ActivatedRoute, private fb: FormBuilder, private http: HttpClient, private api: ApiService) {
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
}
