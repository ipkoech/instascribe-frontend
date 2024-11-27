import { CommonModule } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSlideToggleModule,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Alert } from '../../../core/interfaces/alert.interface';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-notification-alert-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './notification-alert-detail.component.html',
  styleUrl: './notification-alert-detail.component.scss',
})
export class NotificationAlertDetailComponent {
  constructor(
    private activateRoute: ActivatedRoute,
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService
  ) {
    this.activateRoute.data.subscribe(({ alert }) => {
      this.alert = alert;
    });
  }

  triggreForm = new FormGroup({
    trigger_ids: new FormControl(),
  });
  alert: Alert | undefined;

  subscribe_to_email_trigger(triggerIds: string[]) {
    const url = `${this.api.base_uri}triggers/toggle_email_subscription`;
    this.http
      .post(
        url,
        { trigger_ids: triggerIds },
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            console.log('Subscribed to email trigger');
          }
        },
        error: (err) => {
          console.error('Subscription to email failed', err);
        },
      });
  }

  onToggleEmailChange(event: MatSlideToggleChange, trigger: any) {
    if (event.checked) {
      this.subscribe_to_email_trigger([trigger.id]);
    }
  }

  findTriggerUser(trigger: any) {
    return trigger.trigger_users.find(
      (user: any) => user.id === this.userService.user?.id
    );
  }

  isSubscribedInApp(trigger: any) {
    const triggerUser = this.findTriggerUser(trigger);
    return triggerUser ? triggerUser.subscribed_to_in_app : false;
  }

  isSubscribedToEmail(trigger: any) {
    const triggerUser = this.findTriggerUser(trigger);
    return triggerUser ? triggerUser.subscribed_to_email : false;
  }

  subscribe_to_in_app_trigger(triggerIds: string[]) {
    const url = `${this.api.base_uri}triggers/toggle_in_app_subscription`;
    this.http
      .post(
        url,
        { trigger_ids: triggerIds },
        { withCredentials: true, observe: 'response' }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            console.log('Subscribed to in app trigger');
          }
        },
        error: (err) => {
          console.error('Subscription to in app failed', err);
        },
      });
  }

  onToggleInAppChange(event: MatSlideToggleChange, trigger: any) {
    if (event.checked) {
      this.subscribe_to_in_app_trigger([trigger.id]);
    }
  }
}
