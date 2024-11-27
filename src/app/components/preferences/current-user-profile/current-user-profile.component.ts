import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-current-user-profile',
  standalone: true,
  imports: [CommonModule, ProfileComponent],
  templateUrl: './current-user-profile.component.html',
  styleUrl: './current-user-profile.component.scss',
})
export class CurrentUserProfileComponent {
  constructor(public userService: UserService) {}
}
