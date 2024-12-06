import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DraftService } from '../services/draft.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent {
  displayedColumns = [
    'title',
    'status',
    'author',
    'collaborators',
    'created_at',
  ];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private draftService: DraftService) {}

  ngOnInit() {
    this.loadDrafts();
  }

  drafts: any[] = [];
  paginatedDrafts: any[] = []; // Stores drafts for the current page
  currentPage = 1; // Current page number
  pageSize = 3; // Number of drafts per page
  totalPages = 1; // Total pages available

  loadDrafts() {
    this.draftService.fetchDrafts({ 'filter[status]': 'reviewing' }).subscribe({
      next: (response: HttpResponse<any>) => {
        // Check if the response body contains the array, otherwise default to an empty array
        this.drafts = Array.isArray(response.body)
          ? response.body
          : response.body?.data || [];
        this.updatePagination();
      },
      error: (err) => {
        console.error('Failed to load drafts:', err);
        this.drafts = []; // Fallback to an empty array in case of an error
        this.updatePagination();
      },
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.drafts.length / this.pageSize);
    this.paginatedDrafts = this.drafts.slice(
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
