import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router, NavigationStart, RouterModule, NavigationEnd } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { ConversationsResponse } from '../../../core/interfaces/conversation.model';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-chat-side-bar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule, RouterModule],
  templateUrl: './chat-side-bar.component.html',
  styleUrl: './chat-side-bar.component.scss'
})
export class ChatSideBarComponent implements OnInit, OnDestroy {
  conversationId!: string;
  isConversationNew: boolean = false;
  hasChats: boolean = false;
  conversations: ConversationsResponse | undefined;
  private previousUrl: string | null = null;
  private previousConversationId: string | null = null;
  private isCheckingPreviousConversation: boolean = false;

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {
    this.getConversations();
   }

  ngOnInit(): void {
    // Listen for router events to track navigation changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Capture the previous URL before navigation starts
        this.previousUrl = this.router.url;
        this.previousConversationId = this.extractConversationId(this.previousUrl);
      }

      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        const currentConversationId = this.extractConversationId(currentUrl);
        // Check if the user has navigated away from the previous conversation route
        if (this.previousConversationId && this.previousConversationId !== currentConversationId) {
          this.checkAndDeletePreviousConversation(this.previousConversationId);
        }
      }
    });
  }

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
      complete: () => {
      }
    });
  }

  getConversations(): void {
    this.chatService.fetchConversations().subscribe((response: HttpResponse<any>) => {
      this.conversations = response.body || [];
      this.updateHasChats();
    });
  }

  updateHasChats(): void {
    const currentConversation = this.conversations?.data.find((conv) => conv.id === this.conversationId);
    this.hasChats = !!currentConversation && currentConversation?.chats?.length > 0;
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
                  this.getConversations()
                }
              },
              error: (error) => {
                this.getConversations()
              }
            });
          } else {
            this.getConversations()
          }
        }

        this.isCheckingPreviousConversation = false;
      }
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
}
