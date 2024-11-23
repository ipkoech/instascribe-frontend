import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatModel } from '../../../core/interfaces/chat.model';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private toggleEditSidenavSource = new Subject<ChatModel | null>();
  toggleEditSidenav$ = this.toggleEditSidenavSource.asObservable();

  toggleEditSidenav(chatData: ChatModel | null) {
    this.toggleEditSidenavSource.next(chatData);
  }
}
