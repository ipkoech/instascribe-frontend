import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClient, HttpParams, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {

  chatForm: FormGroup;

  constructor(
    private http: HttpClient,
    private api: ApiService,
    public userService: UserService,
    private fb: FormBuilder
  ) {
    this.chatForm = this.fb.group({
      user_input: ['', [Validators.required]],
    });
  }

  @Input() disclaimer = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() recievedMessage = new EventEmitter<string>();

  handleKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onSend(): void {
    if (this.chatForm.valid && this.userService?.user) {
      const userInput = this.chatForm.get('user_input')?.value;
      console.log(userInput);

      if (userInput) {
        // Emit the message to the parent component
        this.sendMessage.emit(userInput);
        // Clear the form input
        this.chatForm.reset();
        this.postChat(userInput);
      }
    }
  }

  chat!: string
  postChat(userInput: string) {
    const userId = this.userService?.user!.id;
    let params = new HttpParams().set('user_input', userInput).set('user_id', userId);
    this.http.post(`${this.api.base_uri}users/${userId}/chat`, {}, {
      params: params, withCredentials: true, observe: 'response',
      responseType: 'text'
    }).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          // Handle both JSON and plain text responses
          const responseBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);

          // Output the response message to the parent component
          this.recievedMessage.emit(responseBody);

          // Optionally store it locally as well
          this.chat = responseBody;
        }
      },
      error: (error) => {
        console.error('Error occurred while posting chat:', error);
      }
    });
  }
}
