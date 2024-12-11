import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpResponse } from '@angular/common/http';
import { ChatService } from '../services/chat.service';
import { ConversationsResponse } from '../../../core/interfaces/conversation.model';
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-insta-ai-landing-page',
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
    RouterModule,
  ],
  templateUrl: './insta-ai-landing-page.component.html',
  styleUrl: './insta-ai-landing-page.component.scss',
})
export class InstaAiLandingPageComponent {
  // Trigger the hidden file input
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  messageForm: FormGroup;
  isLoading: boolean = false;
  selectedFile: File | undefined;
  fileName: string | null = null;
  fileType: string | null = null;
  handleKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      if (this.selectedFile) {
        this.fileName = this.selectedFile.name;
        this.fileType = this.selectedFile.type;
      }
    }
  }

  clearFileSelection(): void {
    this.fileName = null;
    this.selectedFile = undefined;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSend(): void {
    if (this.messageForm.valid && this.userService?.user) {
      const userInput = this.messageForm.get('user_input')?.value;
      const file = this.selectedFile;

      if (userInput || file) {
        this.isLoading = true;
        this.chatService.createConversation().subscribe({
          next: (response: HttpResponse<any>) => {
            if (response.ok && response.body) {
              const conversationId = response.body.id;
              this.sendChatMessage(conversationId, userInput, file);
            }
          },
          error: (error) => {
            console.error('Error creating conversation:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }

  sendChatMessage(conversationId: string, userInput: string, file?: File): void {
    this.chatService.sendChatMessage(conversationId, userInput, file).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.router.navigate(['/ask', conversationId]);
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.messageForm.reset();
        this.clearFileSelection();
      },
    });
  }

  conversations: ConversationsResponse | undefined;

  constructor(private chatService: ChatService, public userService: UserService, private fb: FormBuilder, private router: Router) {
    this.messageForm = this.fb.group({
      user_input: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getConversations();
  }

  getConversations(): void {
    this.chatService
      .fetchConversations()
      .subscribe((response: HttpResponse<any>) => {
        this.conversations = response.body || [];
      });
  }

  getConversationTitle(conversation: any): string {
    if (conversation.title) {
      return conversation.title;
    } else {
      const createdAt = new Date(conversation.created_at);
      return `Conversation started at ${this.formatDate(createdAt)}`;
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
