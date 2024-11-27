import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertsResponse } from '../../../core/interfaces/alert.interface';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notification-alerts',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './notification-alerts.component.html',
  styleUrl: './notification-alerts.component.scss',
})
export class NotificationAlertsComponent {
  constructor(private api: ApiService, private http: HttpClient) {
    this.get_alerts();
  }
  alerts: AlertsResponse | undefined;
  get_alerts() {
    const url = `${this.api.base_uri}alerts`;
    this.http
      .get(url, { withCredentials: true, observe: 'response' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) {
            this.alerts = response.body;
          }
        },
      });
  }
}
