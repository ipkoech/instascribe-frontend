import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavigationComponent } from './components/shared/navigation/navigation.component';
import { CurrentUserProfileComponent } from './components/preferences/current-user-profile/current-user-profile.component';
import { NotificationAlertDetailComponent } from './components/preferences/notification-alert-detail/notification-alert-detail.component';
import { NotificationAlertsComponent } from './components/preferences/notification-alerts/notification-alerts.component';
import { ProfileOverviewComponent } from './components/preferences/profile-overview/profile-overview.component';
import { alertResolver } from './core/services/alert.service';
import { NotificationsComponent } from './components/preferences/notifications/notifications.component';
import { LibraryManagementComponent } from './components/content/library-management/library-management.component';
import { TeamManagementComponent } from './components/content/team-management/team-management.component';
import { SettingsComponent } from './components/preferences/settings/settings.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { RoleDetailComponent } from './components/roles/role-detail/role-detail.component';
import { InstaAiLandingPageComponent } from './components/scribe/insta-ai-landing-page/insta-ai-landing-page.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./components/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: NavigationComponent,
    children: [
      { path: '', redirectTo: 'ask', pathMatch: 'full' },
      {
        path: 'users',
        loadChildren: () =>
          import('./components/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./components/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'content',
        loadChildren: () =>
          import('./components/content/content.routes').then(
            (m) => m.CONTENT_ROUTES
          ),
      },
      {
        path: 'ask',
        loadChildren: () =>
          import('./components/scribe/scribe.routes').then(
            (m) => m.SCRIBE_ROUTES
          ),
      },
      {
        path: 'knowledge-base',
        loadChildren: () =>
          import('./components/knowledge-base/knowledge-base.routes').then(
            (m) => m.KNOWLEDGE_BASE_ROUTES
          ),
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'profile',
        component: ProfileOverviewComponent,
        children: [
          {
            path: '',
            component: CurrentUserProfileComponent,
          },
          { path: 'alerts', component: NotificationAlertsComponent },
          {
            path: 'alerts/:alert',
            component: NotificationAlertDetailComponent,
            resolve: { alert: alertResolver },
          },
        ],
      },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'library-management', component: LibraryManagementComponent },
      { path: 'team-management', component: TeamManagementComponent },
      { path: 'team-management/users/:id', component: UserDetailComponent },
      { path: 'team-management/roles/:id', component: RoleDetailComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
