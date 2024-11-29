import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { Observable } from 'rxjs';
import { UserModel } from '../../../core/interfaces/user.model';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent implements OnInit {
  @Input() sidenav!: MatSidenav;
  user$!: Observable<UserModel | undefined>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.user$ = this.userService.user$;
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/ask') {
          this.sidenav.close();
        }
      });
  }
  isManagementExpanded = false;
  isManagementActive = false;

  isKnowledgeBaseExpanded = false;
  isKnowledgeBaseActive = false;

  isAskScribeActive = false;

  isContentExpanded = false;
  isContentActive = false;

  toggleContent(): void {
    this.isContentExpanded = !this.isContentExpanded;
  }

  toggleKnowledgeBase(): void {
    this.isKnowledgeBaseExpanded = !this.isKnowledgeBaseExpanded;
  }

  toggleManagement(): void {
    this.isManagementExpanded = !this.isManagementExpanded;
  }

  updateContent(): void {
    // Check if any of the child routes are active
    const activeElements = document.querySelectorAll(
      '.nav-group-items .active-link'
    );
    this.isContentActive = activeElements.length > 0;

    // Auto-expand when a child is active
    if (this.isContentActive) {
      this.isContentExpanded = true;
      this.isManagementExpanded = false;
      this.isKnowledgeBaseActive = false;
    }
  }

  updateKnowledgeBaseActive(): void {
    // Check if any of the child routes are active
    const activeElements = document.querySelectorAll(
      '.nav-group-items .active-link'
    );
    this.isKnowledgeBaseActive = activeElements.length > 0;

    // Auto-expand when a child is active
    if (this.isKnowledgeBaseActive) {
      this.isKnowledgeBaseExpanded = true;
      this.isContentActive = false;
      this.isManagementActive = false;
    }
  }

  updateManagementActive(): void {
    // Check if any of the child routes are active
    const activeElements = document.querySelectorAll(
      '.nav-group-items .active-link'
    );
    this.isManagementActive = activeElements.length > 0;

    // Auto-expand when a child is active
    if (this.isManagementActive) {
      this.isManagementExpanded = true;
      this.isContentActive = false;
      this.isKnowledgeBaseActive = false;
    }
  }

  recentChats = [
    { id: 1, name: 'Climate Change' },
    { id: 2, name: 'Marketing Strategy' },
    { id: 3, name: 'Blog Ideas' },
  ];

  selectedChat: number | null = null;

  user = {
    name: 'Sarah Johnson',
    role: 'Content Manager',
  };

  selectChat(chat: any): void {
    this.selectedChat = chat.id;
    console.log(`Selected Chat: ${chat.name}`);
  }

  openSettings(): void {
    console.log('Opening settings...');
  }

  isContentPanelOpen = false; // State for Content Panel

  toggleContentPanel(): void {
    this.isContentPanelOpen = !this.isContentPanelOpen;
  }
}
