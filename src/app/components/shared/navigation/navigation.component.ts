import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { AppBarComponent } from '../app-bar/app-bar.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { UserService } from '../../../core/services/user.service';

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
export class NavigationComponent {
  constructor(public userService: UserService) {
  }

}
