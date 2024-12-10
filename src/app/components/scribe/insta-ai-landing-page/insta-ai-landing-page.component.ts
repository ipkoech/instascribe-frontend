import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpResponse } from '@angular/common/http';
import { ChatService } from '../services/chat.service';
import { ConversationsResponse } from '../../../core/interfaces/conversation.model';
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
        console.log(this.fileName);
      }
    }
  }

  handleKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  conversations: ConversationsResponse | undefined;

  constructor(private chatService: ChatService) {}

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
