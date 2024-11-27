import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updated_at: Date;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [

    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    FormsModule
  ],
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.scss'
})
export class DocsComponent {
  searchQuery: string = '';
  displayedColumns: string[] = ['select', 'title', 'type', 'size', 'lastUpdated', 'actions'];
  documents: Document[] = [];

  selection = new SelectionModel<Document>(true, []);

  // Supported document types
  documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  // MIME type to label mapping
  contentTypeLabels: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
  };

  constructor(private api: ApiService, private http: HttpClient) {
    this.getDocuments(`${this.api.base_uri}/media`, this.documentTypes);
  }

  getDocuments(url: string, contentTypes: string[]) {
    let params = new HttpParams();
    contentTypes.forEach((type) => {
      params = params.append('content_type[]', type);
    });

    this.http.get(url, { withCredentials: true, observe: 'response', params: params }).subscribe({
      next: (response: HttpResponse<any>) => {
        const rawDocuments = response.body || [];
        this.documents = this.transformDocuments(rawDocuments);
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.documents.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.documents.forEach((row) => this.selection.select(row));
  }

  downloadFile(mediaId: string) {
    // Implement download logic here
    this.http.get(`${this.api.base_uri}media/${mediaId}/download`, { withCredentials: true, observe: 'response' }).subscribe({
      next: (response: HttpResponse<any>) => {
        const blob = new Blob([response.body], { type: response.body.type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.body.title;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
      },
    });

  }
}
