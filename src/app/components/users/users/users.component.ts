import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { UserModel, UserModelsResponse } from '../../../core/interfaces/user.model';
import { PageEvent } from '@angular/material/paginator';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  searchQuery = '';
  displayedColumns = ['select', 'user', 'access', 'lastActive', 'dateAdded', 'actions'];
  pageEevent: PageEvent = new PageEvent()
  users: UserModelsResponse | undefined
  userSearch = new FormControl('')
  private debounceTime = 800;


  paginate($event: PageEvent) {
    this.get_users(this.api.base_uri_api + `users?page=${$event.pageIndex + 1}&pageSize=${$event.pageSize}`, $event)
  }

  constructor(private api: ApiService, private http: HttpClient, private dialog: MatDialog, private userService: UserService) {
    this.get_users(this.api.base_uri_api + 'users')
    this.userSearch.valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(value => {
      this.get_users(this.api.base_uri_api + 'users')
    })
  }


  get_users(url: string, pageEvent?: PageEvent) {
    this.http.get(url, { withCredentials: true, observe: 'response', params: new HttpParams().append('include', 'roles').append('filter[f_name]', `${this.userSearch.value}`) }).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.users = response.body
          if (pageEvent)
            this.pageEevent = pageEvent
        }
      }, error: (errorResponse: HttpErrorResponse) => {

      }
    })
  }


}
