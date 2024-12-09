import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressBarModule,
    MatInputModule,
    MatPaginatorModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.scss',
})
export class AppBarComponent {
  userId!: any
  constructor(
    public notificationsService: NotificationService,
    public theme: ThemeService,
    public userService: UserService,
    public http: HttpClient,
    public api: ApiService,
  ) {

    this.userId =this.userService.user?.id

    if(this.userId){
    this.get_notifications(this.userId)
    }
    else{
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.get_notifications(this.userId)
      }
    });
    }

  }
  @Input() sidenav!: MatSidenav;
  unreadNotitications: any
// get user notifications
get_notifications(user_id: any) {
  return this.http.get<any>(this.api.base_uri_api + `users/${user_id}/notifications`, {
    withCredentials: true,
    observe: 'body',
  }).subscribe({
    next: (response: HttpResponse<any>) => {
      // Filter the notifications where read_at is null (unread notifications)
      this.unreadNotitications = response.body?.data.filter((notification: any) => notification.read_at === null);
      console.log(this.unreadNotitications);
      
    },
    error: (err) => {
      console.error('Error fetching notifications', err);
    }
  });
}

  // Method to open settings
  openSettings(): void {
    console.log('Settings clicked');
    // Implement your logic to open settings here
  }

  // Method to show notifications
  showNotifications(): void {
    console.log('Notifications clicked');
    // Implement your logic to display notifications here
  }
}
