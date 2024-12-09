import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
interface Document {
  id: string;
  title: string;
  content_type: string;
  size: number;
  created_at: string;
  updated_at: string;
  azure_url: string;
  access_url: string;
}

@Component({
  selector: 'app-library-management',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './library-management.component.html',
  styleUrl: './library-management.component.scss',
})
export class LibraryManagementComponent {
  // Tab Data
  tabs = [
    {
      label: 'PDF',
      value: 'pdf',
      contentTypes: ['application/pdf']
    },
    {
      label: 'Docs',
      value: 'docs',
      contentTypes: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    },
    {
      label: 'Audio',
      value: 'audio',
      contentTypes: [
        'audio/mpeg',
        'audio/wav',
        'audio/mp4'
      ]
    },
    {
      label: 'Video',
      value: 'video',
      contentTypes: [
        'video/mp4',
        'video/x-msvideo',
        'video/mpeg'
      ]
    },
    {
      label: 'Others',
      value: 'others',
      contentTypes: [] // Will be used for any content type not in other tabs
    }
  ];

  getFilteredDocuments(): Document[] {
    if (!this.selectedTab) return [];

    if (this.selectedTab.value === 'others') {
      const knownTypes = this.tabs
        .filter(tab => tab.value !== 'others')
        .flatMap(tab => tab.contentTypes);

      return this.documents.filter(doc =>
        !knownTypes.includes(doc.content_type)
      );
    }

    return this.documents.filter(doc =>
      this.selectedTab.contentTypes.includes(doc.content_type)
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Default selected tab
  selectedTab = this.tabs[0];

  // Change tab
  selectTab(tab: any): void {
    this.selectedTab = tab;
  }
  // Supported document types
  documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  // MIME type to label mapping
  contentTypeLabels: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'audio/mp4': 'M4A',
    'video/mp4': 'MP4',
    'video/x-msvideo': 'AVI',
    'video/mpeg': 'MPEG',
  };
  documents: Document[] = [];

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private userService: UserService,
    private snackService: SnackBarService,
    private dialog: MatDialog
  ) {

    this.getDocuments(`${this.api.base_uri}/media`, this.documentTypes);
  }
  isUploading: boolean = false;
  uploadProgress: number = 0;
  @ViewChild('uploadProgressDialog') uploadProgressDialog!: TemplateRef<any>;

  uploadFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const dialogRef = this.dialog.open(this.uploadProgressDialog, {
      width: '250px',
      height: '200px',
      hasBackdrop: true,
      disableClose: true,
    });

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.api.base_uri}/media`, formData, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        switch (event.type) {
          case HttpEventType.Response:
            if (event.status === 201 || event.status === 200) {
              this.snackService.success('File uploaded successfully!');
              this.getDocuments(`${this.api.base_uri}/media`, this.documentTypes);
            }
            break;
        }
      },
      error: (error) => {
        this.snackService.error('File upload failed. Please try again.');
        this.isUploading = false;
        dialogRef.close();
      },
      complete: () => {
        console.log('Upload complete');
        setTimeout(() => {
          this.isUploading = false;
          dialogRef.close();
        }, 1000);
      }
    });
  }

  getDocuments(url: string, contentTypes: string[]) {
    let params = new HttpParams();
    contentTypes.forEach((type) => {
      params = params.append('content_type[]', type);
    });

    this.http.get(url, { withCredentials: true, observe: 'response', params: params }).subscribe({
      next: (response: HttpResponse<any>) => {
        this.documents = response.body || [];
      },
      error: (error) => {
        console.error('Error fetching documents:', error);
      },
    });
  }

  // Transform the documents data for display
  transformDocuments(rawDocuments: any[]): any[] {
    return rawDocuments.map((doc) => {
      const contentTypeLabel = this.contentTypeLabels[doc.content_type] || doc.content_type;
      const sizeInMB = (doc.size / (1024 * 1024)).toFixed(2); // Convert size to MB

      return {
        id: doc.id,
        title: doc.title,
        content_type: contentTypeLabel,
        size: `${sizeInMB} MB`,
        updated_at: doc.updated_at,
      };
    });
  }

}
