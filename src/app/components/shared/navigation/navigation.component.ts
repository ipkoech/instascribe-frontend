import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { AppBarComponent } from '../app-bar/app-bar.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    SideNavComponent,
    AppBarComponent,
    MatSidenavModule,
    RouterOutlet],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  constructor(public userService: UserService, public notificationService: NotificationService) {
  }
  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.unreadCount$;
  }


  unreadCount$!: Observable<any>;
}
