import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { ChatSideBarComponent } from '../chat-side-bar/chat-side-bar.component';
import { ChatService } from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatModel } from '../../../core/interfaces/chat.model';
import { ConversationModel } from '../../../core/interfaces/conversation.model';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { EditResponseComponent } from '../edit-response/edit-response.component';
import { SidenavService } from '../services/sidenav.service';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: {
    type: 'edit' | 'like' | 'dislike';
    icon: string;
  }[];
}@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    ChatSideBarComponent,
    MatButtonModule,
    RouterModule,
    EditResponseComponent,
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent implements OnInit {
  conversations: any;
  selectedConversation: ConversationModel | null = null;
  chats: ChatModel[] = [];
  userInput: string = '';
  chatForm: FormGroup;
  @ViewChild('mainSidenav') mainSidenav!: MatSidenav;
  @ViewChild('editSidenav') editSidenav!: MatSidenav;


  constructor(private chatService: ChatService, private sidenavService: SidenavService, public dialog: MatDialog, private fb: FormBuilder, private userService: UserService, private http: HttpClient) {
    this.chatForm = this.fb.group({
      user_input: ['', [Validators.required]],
    });
  }

  toggleEditSidenav() {
    this.mainSidenav.close();
    this.editSidenav.open();
  }

  handleKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  createConversation(): void {
    this.chatService.createConversation().subscribe((conversation) => {
      // this.conversationId = conversation.id;
      // this.isConversationNew = true;
    });
  }

  onSend(): void {
    if (this.chatForm.valid && this.userService?.user) {
      const userInput = this.chatForm.get('user_input')?.value;
      if (userInput) {
        // Emit the message to the parent component
        // Clear the form input
        this.chatForm.reset();
        this.sendMessage();
      }
    }
  }

  chat!: string
  params = {
    per_page: -1,
    archived: false,
  }
  ngOnInit(): void {
    // this.createAndSelectConversation();
    this.loadConversations(this.params);

    this.sidenavService.toggleEditSidenav$.subscribe((data) => {
      if (data) {
        this.editSidenav.open();
      } else {
        this.editSidenav.close();
      }
    });
  }

  createAndSelectConversation(): void {
    this.chatService.createConversation().subscribe((conversation) => {
      this.conversations.push(conversation);
      this.selectConversation(conversation);
    });
  }

  loadConversations(params?: {}): void {
    this.chatService.fetchConversations(params).subscribe({
      next: (response: HttpResponse<any>) => {
        this.conversations = response.body;
      }
    });
  }

  selectConversation(conversation: ConversationModel): void {
    this.selectedConversation = conversation;
    this.loadChats(conversation.id);
  }

  loadChats(conversationId: string): void {
    this.chatService.fetchChats(conversationId).subscribe((chats) => {
      this.chats = chats;
    });
  }

  sendMessage(): void {
    if (this.selectedConversation && this.userInput.trim()) {
      this.chatService.sendChatMessage(this.selectedConversation.id, this.userInput).subscribe((chat) => {
        this.chats.push(chat.user_input);
        this.userInput = '';
      });
    }
  }
}
