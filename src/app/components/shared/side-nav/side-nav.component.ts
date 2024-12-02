import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { Observable } from 'rxjs';
import { UserModel } from '../../../core/interfaces/user.model';
import { ChatService } from '../../scribe/services/chat.service';
import { ConversationsResponse } from '../../../core/interfaces/conversation.model';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    public userService: UserService,
    private chatService: ChatService
  ) {
    //chat side bar code
    this.getConversations();
  }

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

    //chat-side-bar code
    // Listen for router events to track navigation changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Capture the previous URL before navigation starts
        this.previousUrl = this.router.url;
        this.previousConversationId = this.extractConversationId(
          this.previousUrl
        );
      }

      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        const currentConversationId = this.extractConversationId(currentUrl);
        // Check if the user has navigated away from the previous conversation route
        if (
          this.previousConversationId &&
          this.previousConversationId !== currentConversationId
        ) {
          this.checkAndDeletePreviousConversation(this.previousConversationId);
        }
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

  selectedChat: number | null = null;

  selectChat(chat: any): void {
    this.selectedChat = chat.id;
    console.log(`Selected Chat: ${chat.name}`);
  }

  isContentPanelOpen = false; // State for Content Panel

  toggleContentPanel(): void {
    this.isContentPanelOpen = !this.isContentPanelOpen;
  }

  //chat-side-bar
  conversationId!: string;
  isConversationNew: boolean = false;
  hasChats: boolean = false;
  conversations: ConversationsResponse | undefined;
  private previousUrl: string | null = null;
  private previousConversationId: string | null = null;
  private isCheckingPreviousConversation: boolean = false;

  ngOnDestroy(): void {
    // Ensure the previous conversation is checked when the component is destroyed
    if (this.previousConversationId) {
      this.checkAndDeletePreviousConversation(this.previousConversationId);
    }
  }

  createConversation(): void {
    this.chatService.createConversation().subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          const conversation = response.body;
          this.conversationId = conversation.id;
          this.getConversations();
          this.router.navigate(['/ask', this.conversationId]);
          this.isConversationNew = true;
        }
      },
      error: (error) => {
        this.getConversations();
      },
      complete: () => {},
    });
  }

  getConversations(): void {
    this.chatService
      .fetchConversations()
      .subscribe((response: HttpResponse<any>) => {
        this.conversations = response.body || [];
        this.updateHasChats();
      });
  }

  updateHasChats(): void {
    const currentConversation = this.conversations?.data.find(
      (conv) => conv.id === this.conversationId
    );
    this.hasChats =
      !!currentConversation && currentConversation?.chats?.length > 0;
  }

  checkAndDeletePreviousConversation(conversationId: string): void {
    if (this.isCheckingPreviousConversation) {
      return; // Prevent multiple checks
    }

    this.isCheckingPreviousConversation = true;

    this.chatService.fetchConversation(conversationId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          const conversation = response.body;
          const hasChats = conversation?.chats?.length > 0;
          if (!hasChats) {
            this.chatService.deleteConversation(conversation.id).subscribe({
              next: (response: HttpResponse<any>) => {
                if (response.ok) {
                  this.getConversations();
                }
              },
              error: (error) => {
                this.getConversations();
              },
            });
          } else {
            this.getConversations();
          }
        }

        this.isCheckingPreviousConversation = false;
      },
    });
  }

  private extractConversationId(url: string): string | null {
    const match = url.match(/\/ask\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  getConversationTitle(conversation: any): string {
    if (conversation.title) {
      return conversation.title;
    } else {
      const createdAt = new Date(conversation.created_at);
      return `Conversation started at ${this.formatDate(createdAt)}`;
    }
  }

  // Helper method to format the date
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  isPostsPanelOpen: boolean = false;

  // Toggle the Posts Panel
  togglePostsPanel(): void {
    this.isPostsPanelOpen = !this.isPostsPanelOpen;
  }
}
