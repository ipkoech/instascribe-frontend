import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

interface FileItem {
  name: string;
  size: string;
  type: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  lastModified: Date;
}@Component({
  selector: 'app-all-files',
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
  templateUrl: './all-files.component.html',
  styleUrl: './all-files.component.scss'
})
export class AllFilesComponent {

  displayedColumns = ['select', 'name', 'uploadedBy', 'lastModified', 'actions'];

  recentFiles: FileItem[] = [
    {
      name: 'Dashboard tech requirements',
      size: '220 KB',
      type: 'docx',
      uploadedBy: { name: 'Amélie Laurent', email: 'amelie@untitledui.com' },
      lastModified: new Date('2024-01-04')
    },
    {
      name: 'Q4_2023 Reporting',
      size: '1.2 MB',
      type: 'pdf',
      uploadedBy: { name: 'Anmar Foley', email: 'anmar@untitledui.com' },
      lastModified: new Date('2024-01-05')
    },
    {
      name: 'FY_2022-23 Financials',
      size: '628 KB',
      type: 'xls',
      uploadedBy: { name: 'Sienna Hewitt', email: 'sienna@untitledui.com' },
      lastModified: new Date('2024-01-06')
    }
  ];

  files: FileItem[] = [
    ...this.recentFiles,
    {
      name: 'Marketing site requirements',
      size: '488 KB',
      type: 'docx',
      uploadedBy: { name: 'Mathilde Lewis', email: 'mathilde@untitledui.com' },
      lastModified: new Date('2024-01-06')
    }
  ];

  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'docx':
        return 'description';
      case 'xls':
        return 'grid_on';
      default:
        return 'insert_drive_file';
    }
  }
}
