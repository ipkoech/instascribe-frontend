import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DraftService } from '../services/draft.service';
import { HttpResponse } from '@angular/common/http';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DraftsResponse } from '../../../core/interfaces/draft.model';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss',
})
export class CollaborationComponent {
  constructor(private route: ActivatedRoute, private api: ApiService, private draftService: DraftService) {
    this.fetchSharedDrafts();
  }
drafts: DraftsResponse|undefined
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  fetchSharedDrafts() {
    this.draftService
      .fetcSharedDrafts({ 'filter[status]': '!reviewing,approved' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.dataSource = response.body;
          this.drafts = response.body;
          if (this.paginator) {
            this.paginator.length = response.body.length;
            this.dataSource.sort = this.sort;
            this.updatePagination();
          }
        },
      });
  }

  getPermissionLabel(permission: string): string {
    switch (permission) {
      case 'edit':
        return 'Edit';
      case 'view':
        return 'View Only';
      case 'comment':
        return 'Comment Only';
      default:
        return 'Unknown';
    }
  }

  getPermissionIcon(permission: string): string {
    switch (permission) {
      case 'edit':
        return 'edit';
      case 'view':
        return 'visibility';
      case 'comment':
        return 'comment';
      default:
        return 'help_outline';
    }
  }



  //new pagination code
  paginatedDrafts: any[] = []; // To store drafts for the current page
  currentPage = 1; // Current page number
  pageSize = 3; // Number of drafts per page
  totalPages = 1; // Total pages available

  updatePagination() {
    const data = this.dataSource.data;
    this.totalPages = Math.ceil(data.length / this.pageSize);
    this.paginatedDrafts = data.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
    this.updatePagination();
  }
}
