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
    RouterModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent {

  displayedColumns = ['title', 'status', 'author', 'collaborators', 'created_at'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private draftService: DraftService) { }

  ngOnInit() {
    this.loadDrafts();
  }

  loadDrafts() {
    this.draftService.fetchDrafts({ 'filter[status]': 'reviewing' }).subscribe({
      next: (response: HttpResponse<any>) => {
        this.dataSource = response.body;
        if (this.paginator) {
          this.paginator.length = response.body.length;
          this.dataSource.sort = this.sort;
        }
      }
    });
  }
}
