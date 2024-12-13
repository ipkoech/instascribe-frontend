import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import {
  ConversationModel,
  ConversationsResponse,
} from '../../../core/interfaces/conversation.model';
import { HttpResponse } from '@angular/common/http';
import { WebsocketsService } from '../../../core/services/websockets.service';
import { MatMenuModule } from '@angular/material/menu';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SettingsService } from '../../preferences/services/settings.service';

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
    MatMenuModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent implements OnInit {
  @Input() sidenav!: MatSidenav;
  user$!: Observable<UserModel | undefined>;
  companyName$!: Observable<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public userService: UserService,
    private chatService: ChatService,
    private websocketsService: WebsocketsService,
    private snackService: SnackBarService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    //chat side bar code
    this.getConversations(this.params);
    this.fetchArchivedConversations(this.archivedParams);
    // Subscribe to company name observable from the service
    this.companyName$ = this.settingsService.companyName$;
    // Load the initial company information
    this.settingsService.loadCompanyInfo();
  }
  params = {
    per_page: -1,
    archived: false,
  };

  archivedParams = {
    per_page: -1,
    archived: true,
  };
  @ViewChild('deleteConvoDialog') deleteConvoDialog!: TemplateRef<any>;
  @ViewChild('editConvoDialog') editConvoDialog!: TemplateRef<any>;
  @ViewChild('archiveConvo') archiveConvo!: TemplateRef<any>;

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
        this.listenToConversationChannels(currentConversationId);
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

          this.getConversations(this.params);
          this.router.navigate(['/ask', this.conversationId]);
          this.isConversationNew = true;
        }
      },
      error: (error) => {
        this.getConversations(this.params);
      },
      complete: () => {},
    });
  }

  getConversations(params?: {}): void {
    this.chatService
      .fetchConversations(params)
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
                  this.getConversations(this.params);
                }
              },
              error: (error) => {
                this.getConversations(this.params);
              },
            });
          } else {
            this.getConversations(this.params);
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
  contentHeight = 0;

  // Toggle the Posts Panel
  togglePostsPanel(): void {
    this.isPostsPanelOpen = !this.isPostsPanelOpen;
  }

  // Listen to chat events to update the conversation list
  listenToConversationChannels(conversation_id: string | null): void {
    this.websocketsService.subscribeAndListenToChannel(
      'ConversationChannel',
      { conversation_id: conversation_id },
      (data: any) => {
        if (data.action === 'new_conversation_title') {
          this.getConversations(this.params);
        }
        if (data.action === 'destroy') {
          this.router.navigate(['/ask']);
        }
      }
    );
  }
  shareConversation(_t14: ConversationModel) {
    throw new Error('Method not implemented.');
  }
  renameConversation(conversation: ConversationModel): void {
    const dialogRef = this.dialog.open(this.editConvoDialog, {
      width: '300px',
      hasBackdrop: true,
      data: {
        title: 'Rename Conversation',
        inputLabel: 'New Title',
        inputValue: conversation.title,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result) {
        this.chatService
          .updateConversation(conversation, { title: result })
          .subscribe({
            next: (response: HttpResponse<any>) => {
              if (response.ok) {
                this.snackService.success('Conversation renamed successfully');

                this.getConversations(this.params);
              }
            },
            error: (error) => {
              this.snackService.error('Error renaming conversation');
            },
          });
      }
    });
  }

  // Delete a conversation
  deleteConversation(conversation: ConversationModel): void {
    const dialogRef = this.dialog.open(this.deleteConvoDialog, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Delete Conversation?',
        message: `This will permanently delete the conversation "${conversation.title}". Are you sure you want to proceed?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.chatService.deleteConversation(conversation.id).subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.ok) {
              this.snackService.info('Conversation deleted successfully');

              this.getConversations(this.params);
            }
          },
          error: (error) => {
            this.getConversations(this.params);
            this.snackService.error('Error deleting conversation');
          },
        });
      }
    });
  }
  //  Archive a conversation
  archiveConversation(conversation: ConversationModel): void {
    let dialogReft = this.dialog.open(this.archiveConvo, {
      width: '400px',
      hasBackdrop: true,
      data: {
        title: 'Archive Conversation?',
        message: `This will archive the conversation "${conversation.title}". Are you sure you want to proceed?`,
      },
    });
    dialogReft.afterClosed().subscribe((result) => {
      if (result) {
        this.chatService.archiveCionversation(conversation).subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.ok) {
              this.snackService.success('Conversation archived successfully');
              this.fetchArchivedConversations(this.archivedParams);
              this.getConversations(this.params);
            }
          },
          error: (error) => {
            this.snackService.error('Error archiving conversation');
          },
        });
      }
    });
  }

  //  Unarchive a conversation
  unarchiveConversation(conversation: ConversationModel): void {
    this.chatService.unarchiveConversation(conversation).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.snackService.success('Conversation unarchived successfully');
          this.getConversations(this.params);
          this.fetchArchivedConversations(this.archivedParams);
        }
      },
      error: (error) => {
        this.snackService.error('Error unarchiving conversation');
      },
    });
  }

  archivedConversations!: ConversationsResponse;
  fetchArchivedConversations(params?: {}): void {
    this.chatService
      .fetchConversations(params)
      .subscribe((response: HttpResponse<any>) => {
        this.archivedConversations = response.body || [];

        this.updateHasChats();
      });
  }
}
