import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { DraftService } from '../services/draft.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
})
export class PostsComponent {

  constructor(private draftService: DraftService, private router: Router) {}

  ngOnInit() {
    this.loadDrafts();
  }

  drafts: any[] = [];
  paginatedDrafts: any[] = []; // Stores drafts for the current page
  currentPage = 1; // Current page number
  pageSize = 3; // Number of drafts per page
  totalPages = 1; // Total pages available

  loadDrafts() {
    this.draftService.fetchDrafts({ 'filter[status]': 'approved' }).subscribe({
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
