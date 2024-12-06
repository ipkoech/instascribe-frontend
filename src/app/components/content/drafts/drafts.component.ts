import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { DraftService } from '../services/draft.service';
import { HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-drafts',
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
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent implements OnInit {
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

  loadDrafts() {
    this.draftService
      .fetchDrafts({ 'filter[status]': '!reviewing' })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.dataSource = response.body;
          if (this.paginator) {
            this.paginator.length = response.body.length;
            this.dataSource.sort = this.sort;
          }
          this.updatePagination();
        },
      });
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
