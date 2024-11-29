import { Routes } from '@angular/router';
import { AskScribeComponent } from './ask-scribe/ask-scribe.component';
import { ChatsComponent } from './chats/chats.component';

export const SCRIBE_ROUTES: Routes = [
  {
    path: '',
    component: ChatsComponent,
    children: [{ path: ':id', component: AskScribeComponent }],
  },
];
