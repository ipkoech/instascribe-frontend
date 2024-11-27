import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-files-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './files-overview.component.html',
  styleUrl: './files-overview.component.scss'
})
export class FilesOverviewComponent {

  tabs = [
    { label: 'View all', route: 'all' },
    { label: 'Documents', route: 'docs' },
    { label: 'Podcasts', route: 'podcasts' },
    { label: 'Audio/Videos', route: 'audio-video' },
  ];
  activeLink = this.tabs[0].route;


  constructor(private http: HttpClient, private api: ApiService, private userService: UserService) { }
  isUploading: boolean = false;

  uploadFile(event: any, fileType: string) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const formData = new FormData();
      const user = this.userService.user;
      formData.append('file', file);
      this.http.post(`${this.api.base_uri}media`, formData, { withCredentials: true, observe: 'response' })
        .subscribe({
          next: (response: HttpResponse<any>) => {
            console.log(response.body);
          }
        });
    }
  }

}
