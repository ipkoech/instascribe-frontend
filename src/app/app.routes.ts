import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavigationComponent } from './components/shared/navigation/navigation.component';
import { SettingsComponent } from './components/preferences/settings/settings.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: 'users',
        loadChildren: () => import('./components/users/users.routes')
          .then(m => m.USERS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () => import('./components/roles/roles.routes')
          .then(m => m.ROLES_ROUTES)
      },
      {
        path: 'content',
        loadChildren: () => import('./components/content/content.routes')
          .then(m => m.CONTENT_ROUTES)
      },
      {
        path: 'ask',
        loadChildren: () => import('./components/scribe/scribe.routes')
          .then(m => m.SCRIBE_ROUTES)
      },
      {
        path: 'knowledge-base',
        loadChildren: () => import('./components/knowledge-base/knowledge-base.routes')
          .then(m => m.KNOWLEDGE_BASE_ROUTES)
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ]
  }
];
