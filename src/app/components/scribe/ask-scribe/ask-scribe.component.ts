import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { ChatModel, ChatsResponse } from '../../../core/interfaces/chat.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChatService } from '../services/chat.service';
import { UserService } from '../../../core/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { marked } from 'marked';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WebsocketsService } from '../../../core/services/websockets.service';
import { ApiService } from '../../../core/services/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditResponseComponent } from '../edit-response/edit-response.component';
import { SidenavService } from '../services/sidenav.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConversationModel } from '../../../core/interfaces/conversation.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface SaveDraftDialogData {
  chat: ChatModel;
}
@Component({
  selector: 'app-ask-scribe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatProgressBarModule
  ],
  templateUrl: './ask-scribe.component.html',
  styleUrl: './ask-scribe.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AskScribeComponent implements AfterViewInit, OnInit, OnDestroy {
  chat!: ChatModel;
  conversation_id!: string;
  chats: ChatsResponse | undefined;
  chatForm: FormGroup;
  isLoading: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  showScrollToBottom: boolean = false;
  currentChannelSubscription: string | null = null;

  constructor(
    private chatService: ChatService,
    public userService: UserService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private snackBarService: SnackBarService,
    private websocketsService: WebsocketsService,
    private http: HttpClient,
    private api: ApiService,
    private sidenavService: SidenavService
  ) {
    this.chatForm = this.fb.group({
      user_input: ['', [Validators.required]],
    });
    this.activatedRoute.params.subscribe(async (params) => {
      const newConversationId = params['id'];
      if (
        this.currentChannelSubscription &&
        this.currentChannelSubscription !== newConversationId
      ) {
        this.websocketsService.unsubscribeFromChannel(
          `ChatChannel_${this.currentChannelSubscription}`
        );
      }
      if (newConversationId) {
        this.conversation_id = newConversationId;
        this.loadConversation(newConversationId); // Load the conversation details
        this.subscribeToChatUpdates(newConversationId); // Subscribing to updates for the new conversation
        this.currentChannelSubscription = newConversationId;
        this.loadChats(); // Load the existing chats for the conversation
      }
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.scrollToBottom();
    this.messagesContainer.nativeElement.addEventListener(
      'scroll',
      this.onScroll.bind(this)
    );
  }
conversation!: ConversationModel

  loadConversation(id: string) {
    this.chatService.fetchConversation(id).subscribe({
      next: (response: HttpResponse<any>) => {
        // 
        this.conversation = response.body;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.currentChannelSubscription) {
      this.websocketsService.unsubscribeFromChannel(
        `ChatChannel_${this.currentChannelSubscription}`
      );
    }
  }

  launchContentEditor(message: ChatModel) {
    this.sidenavService.toggleEditSidenav(message);
  }
  getFileFormat(contentType: any): string {
    const formats: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX'
    };
    return formats[contentType] || 'FILE';
  }
  
  onScroll(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      const atBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight;
      this.showScrollToBottom = !atBottom;
    }
  }
  handleKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  // Trigger the hidden file input
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  selectedFile: File | undefined;
  fileName: string | null = null;
  fileType: string | null = null;

  clearFileSelection(): void {
    this.fileName = null;
    this.selectedFile = undefined;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset file input
    }
  }

  // Handle file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Get the selected file
      if (this.selectedFile) {
        this.fileName = this.selectedFile.name;
        this.fileType = this.selectedFile.type;
      }
    }
  }

  onSend(): void {
    if (this.chatForm.valid && this.userService?.user) {
      const userInput = this.chatForm.get('user_input')?.value;
      const file = this.selectedFile;

      if (userInput || file) {
        // Call the chat service with user input and the file (if any)
        this.sendChatMessage(userInput, file);

        // Clear form and reset file selection
        this.chatForm.reset();
        this.selectedFile = undefined;
        this.clearFileSelection();
      }
    }
  }

  sendChatMessage(userInput: string, file?: File): void {
    this.isLoading = true;
    const conversationId = this.conversation_id;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.chatService
      .sendChatMessage(conversationId, userInput, file)
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.chat = response.body;
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isLoading = false;
          this.loadChats();
        },
        complete: () => {
          this.isLoading = false;
          this.loadConversation(this.conversation_id);
          this.scrollToBottom();
        },
      });
  }

  loadChat(chat: ChatModel) {
    this.chatService.fetchChat(chat).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.chat = response.body;
        }
      },
      error: (error) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  retry(arg0: any) {
    this.isLoading = true;
    const userId = this.userService?.user!.id;
    this.chatService.sendChatMessage(this.conversation_id, arg0).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.chat = response.body;
          this.updateBotReply(arg0, response.body.bot_reply);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.updateBotReply(arg0, 'Something went wrong. Please try again.');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  updateBotReply(userInput: string, botReply: string) {
    // Find the placeholder message and update it with the actual bot response
    const botMessageIndex = this.chats?.data.findIndex(
      (chat) => chat.role === 'bot' && chat.bot_reply === 'Loading...'
    );
    if (botMessageIndex !== -1 && this.chats?.data) {
      this.chats.data[botMessageIndex!].bot_reply = botReply;
      this.chats.data[botMessageIndex!].updated_at = new Date();
    }
  }

  loadChats(retryCount = 0): void {
    this.chatService.fetchChats(this.conversation_id).subscribe({
      next: (response: HttpResponse<any>) => {
        this.chats = response.body;
        this.scrollToBottom();
      },
      error: () => {
        if (retryCount < 3) {
          // Retry loading chats up to 3 times
          setTimeout(() => this.loadChats(retryCount + 1), 200);
        } else {
          this.snackBarService.error('Failed to load chats. Please try again.');
        }
      },
    });
  }

  parseMarkdown(markdown: string | undefined): any {
    if (!markdown) {
      return '';
    }
    const html = marked.parse(markdown);
    return html;
  }

  likeMessage(chat: ChatModel) {
    this.chatService.like(chat).subscribe({
      next: (response: HttpResponse<any>) => {
        // this.loadChats();
      },
    });
  }

  dislikeMessage(chat: ChatModel) {
    this.chatService.dislike(chat).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          // this.loadChats();
        }
      },
    });
  }

  copyMessage(chat: ChatModel) {
    const messageToCopy =
      chat.role === 'user' ? chat.user_input : chat.bot_reply;

    if (messageToCopy) {
      navigator.clipboard.writeText(messageToCopy).then(
        () => {
          this.snackBarService.success(
            'Message copied to clipboard!',
            500,
            'center',
            'top'
          );
        },
        (err) => {
          this.snackBarService.error('Failed to copy message: ' + err);
        }
      );
    }
  }

  saveMessage(_t5: ChatModel) {
    this.snackBarService.info(`${_t5.id} saved!`);
  }

  subscribeToChatUpdates(conversationId: string): Promise<void> {
    return new Promise(() => {
      this.websocketsService.subscribeAndListenToChannel(
        'ChatChannel',
        { conversation_id: conversationId },
        (data: any) => {
          this.handleWebSocketUpdate(data);
        }
      );
    });
  }

  loadingMessageIds: Set<string> = new Set();

  handleWebSocketUpdate(data: any): void {
    if (data.chat?.conversation_id === this.conversation_id) {
      const messageExists = this.chats?.data?.some(
        (msg) => msg.id === data.chat.id
      );

      if (!messageExists) {
        this.chats?.data.push(data.chat);
        this.loadingMessageIds.add(data.chat.id);
        this.loadChats();
        this.scrollToBottom();
      }

      // If the message is updated (e.g., bot reply), update the message
      if (data.action === 'update') {
        const messageIndex = this.chats?.data.findIndex(
          (msg) => msg.id === data.chat.id
        );
        if (messageIndex !== -1) {
          this.chats!.data[messageIndex!] = data.chat;
          this.loadingMessageIds.add(data.chat.id);
          this.scrollToBottom();
        }
      }

      if (data.action === 'chat_created') {
        this.loadChats(); // Refresh the chat list
        this.scrollToBottom(); // Scroll to the bottom
      }
      if (data.action === 'file_attached') {
        // File upload completed
        this.isUploading = false;
        this.uploadProgress = 100;
        
        // Update chat with file information
        const messageIndex = this.chats?.data.findIndex(msg => msg.id === data.chat_id);
        if (messageIndex !== -1) {
          // this.chats!.data[messageIndex!].file_url = data.file_url;
          // this.chats!.data[messageIndex!].file_name = data.file_name;
        }
      }
    }
  }
  uploadProgress: number = 0;
  isUploading: boolean = false;

}
