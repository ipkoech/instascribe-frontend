import { Routes } from '@angular/router';
import { AskScribeComponent } from './ask-scribe/ask-scribe.component';
import { ChatsComponent } from './chats/chats.component';
import { InstaAiLandingPageComponent } from './insta-ai-landing-page/insta-ai-landing-page.component';

export const SCRIBE_ROUTES: Routes = [
  {
    path: '',
    component: ChatsComponent,
    children: [
      { path: '', component: InstaAiLandingPageComponent },
      { path: ':id', component: AskScribeComponent },
    ],
  },
];
