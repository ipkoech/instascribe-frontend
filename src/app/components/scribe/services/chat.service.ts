import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { ChatModel } from '../../../core/interfaces/chat.model';
import { WebsocketsService } from '../../../core/services/websockets.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatUpdates$ = new BehaviorSubject<ChatModel | null>(null);

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService,
    private websocketsService: WebsocketsService
  ) { }

  createConversation(): Observable<any> {
    return this.http.post(`${this.api.base_uri}conversations`, {}, { withCredentials: true, observe: 'response' });
  }

  // Updated method to support file uploads
  sendChatMessage(conversationId: string, userInput: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('user_input', userInput);

    // Append the file if provided
    if (file) {
      formData.append('file', file);
    }

    return this.http.post(`${this.api.base_uri}conversations/${conversationId}/chats`, formData, {
      withCredentials: true,
      observe: 'response',
    });
  }

  deleteConversation(conversationId: string): Observable<any> {
    return this.http.delete(`${this.api.base_uri}conversations/${conversationId}`, { withCredentials: true, observe: 'response' });
  }


  // fetch chats
  fetchChats(conversationId: string): Observable<any> {
    return this.http.get(`${this.api.base_uri}conversations/${conversationId}/chats`, { withCredentials: true, observe: 'response', params: new HttpParams().append('per_page', -1) });
  }


  // fetch conversations
  fetchConversations(): Observable<any> {
    return this.http.get(`${this.api.base_uri}conversations`, { withCredentials: true, observe: 'response' });
  }


  // fetch conversations
  fetchConversation(id: string): Observable<any> {
    return this.http.get(`${this.api.base_uri}conversations/${id}`, { withCredentials: true, observe: 'response' });
  }

  // fetch conversations
  fetchChat(chat: ChatModel): Observable<any> {
    return this.http.get(`${this.api.base_uri}conversations/${chat.conversation_id}/chats/${chat.id}`, { withCredentials: true, observe: 'response' });
  }


  // fetch conversations
  updateChat(chat: ChatModel): Observable<any> {
    return this.http.post(`${this.api.base_uri}conversations/${chat.conversation_id}/chats/${chat.id}`, { withCredentials: true, observe: 'response' });
  }

  // Like chat
  like(chat: ChatModel): Observable<any> {
    return this.http.post(`${this.api.base_uri}conversations/${chat.conversation_id}/chats/${chat.id}/like`, {}, { withCredentials: true, observe: 'response' });
  }
  // Like chat
  dislike(chat: ChatModel): Observable<any> {
    return this.http.post(`${this.api.base_uri}conversations/${chat.conversation_id}/chats/${chat.id}/dislike`, {}, { withCredentials: true, observe: 'response' });
  }


}
