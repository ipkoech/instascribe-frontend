import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime } from 'rxjs';
import { UserModel, UserModelsResponse } from '../../../core/interfaces/user.model';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';
import { AddUserDialogComponent } from '../../users/add-user-dialog/add-user-dialog.component';
import { RoleModel, RolesResponse } from '../../../core/interfaces/role.model';
import { AddRoleDialogComponent } from '../../roles/add-role-dialog/add-role-dialog.component';
import { PermissionsResponse } from '../../../core/interfaces/permission.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { EditUserDialogComponent } from '../../users/edit-user-dialog/edit-user-dialog.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.scss',
})
export class TeamManagementComponent {
  activeTab: string = 'overview'; // Default active tab

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }


  roles: RolesResponse | undefined;
  permissions: PermissionsResponse | undefined;

  searchQuery = '';
  displayedColumns = ['select', 'user', 'access', 'lastActive', 'dateAdded', 'actions'];
  pageEevent: PageEvent = new PageEvent()
  users: UserModelsResponse | undefined
  userSearch = new FormControl('')
  private debounceTime = 800;


  paginate($event: PageEvent) {
    this.get_users(this.api.base_uri_api + `users?page=${$event.pageIndex + 1}&pageSize=${$event.pageSize}`, $event)
  }

  constructor(private api: ApiService, private http: HttpClient, private dialog: MatDialog, private cdr: ChangeDetectorRef, private snack: MatSnackBar, private snackService: SnackBarService, private userService: UserService) {
    this.get_users(this.api.base_uri_api + 'users')
    this.get_roles(`${this.api.base_uri}roles`);
    this.get_permissions(`${this.api.base_uri}permissions`)
    this.userSearch.valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(value => {
      this.get_users(this.api.base_uri_api + 'users')
    })
  }



  getPendingInvitations() {

    const users = this.users;
    if (!users) {
      return [];
    }
    const pendingInvitations = users.data.filter((user) => user.last_seen_at === null);
    return pendingInvitations;
  }

  deleteRole(_t143: RoleModel) {
    this.http.delete(this.api.base_uri + 'roles/' + _t143.id, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.get_roles(`${this.api.base_uri}roles`)
        this.snackService.info('Role deleted successfully',);
      },
      error: (error: HttpErrorResponse) => {
        this.snackService.info(error.error.message);
      }
    });
  }
  editRole(_t143: RoleModel) {
    throw new Error('Method not implemented.');
  }
  createNewRole() {
    throw new Error('Method not implemented.');
  }
  deleteUser(_t108: UserModel) {
    throw new Error('Method not implemented.');
  }
  editUser(_t108: UserModel) {
    throw new Error('Method not implemented.');
  }
  get_users(url: string, pageEvent?: PageEvent) {
    this.http.get(url, { withCredentials: true, observe: 'response', params: new HttpParams().append('include', 'roles').append('filter[f_name]', `${this.userSearch.value}`) }).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.ok) {
          this.users = response.body
          if (this.users) {
            this.getPendingInvitations()
          }
          if (pageEvent)
            this.pageEevent = pageEvent
        }
      }, error: (errorResponse: HttpErrorResponse) => {

      }
    })
  }

  add_new_user() {
    let dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '400px',
      hasBackdrop: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.get_users(`${this.api.base_uri}users`);
    });
  }


  get_roles(url: string) {
    this.http
      .get(url, {
        observe: 'response',
        withCredentials: true,
        params: new HttpParams()
          .append('per_page', -1)
          .append('order_by', 'created_at desc')
          .append('include', 'permissions'),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.roles = response.body;
          if (this.roles) this.filteredRoles = this.roles.data;
          this.filterRoles();
          this.setPaginatedRoles();
          this.cdr.detectChanges();
        },
      });
  }

  get_permissions(url: string) {
    this.http
      .get(url, {
        observe: 'response',
        withCredentials: true,
        params: new HttpParams()
          .append('per_page', -1)
          .append('order_by', 'created_at desc'),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.permissions = response.body;
          this.cdr.detectChanges();
        },
      });
  }

  hasPermission(role: RoleModel, permissionId: string) {
    return role.permissions.some(
      (permission) => permission.id === permissionId
    );
  }

  permissionForm = new FormGroup({
    permission_ids: new FormControl([]),
  });

  detachPermissions(role: RoleModel) {
    this.http
      .post(
        `${this.api.base_uri}roles/${role.id}/detach_permissions`,
        this.permissionForm.value,
        {
          withCredentials: true,
          observe: 'response',
        }
      )
      .subscribe({
        next: (response: HttpResponse<any>) => { },
      });
  }

  delete(role: RoleModel) {
    this.snack
      .open(`Confirm deletion.`, 'Confirm', { duration: 3000 })
      .onAction()
      .subscribe(() => {
        this.http
          .delete(`${this.api.base_uri}roles/${role.id}`, {
            withCredentials: true,
            observe: 'response',
          })
          .subscribe({
            next: (response: HttpResponse<any>) => {
              if (response.ok) {
              }
            },
            complete: () => {
              this.get_roles(`${this.api.base_uri}roles`);
            },
          });
      });
  }

  add_role() {
    let dialogRef = this.dialog.open(AddRoleDialogComponent, {
      width: '700px',
      height: 'fit-content',
      hasBackdrop: true,
    });
    dialogRef.afterClosed().subscribe(() => {
      this.get_roles(`${this.api.base_uri}roles`);
    });
  }

  pageSize = 5;
  currentPage = 0;
  paginatedRoles: any[] = [];
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.setPaginatedRoles();
  }

  setPaginatedRoles() {
    const rolesToPaginate =
      this.filteredRoles.length > 0
        ? this.filteredRoles
        : this.roles?.data || [];
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedRoles = rolesToPaginate.slice(startIndex, endIndex);
  }

  searchTerm: string = '';
  filteredRoles: RoleModel[] = [];
  filterRoles() {
    if (this.roles) {
      const searchTermLower = this.searchTerm.toLowerCase();

      // Filter the roles based on the search term
      this.filteredRoles = this.roles.data.filter((role) =>
        role.name.toLowerCase().includes(searchTermLower)
      );

      // Reset pagination to the first page
      this.currentPage = 0;

      // Update the paginated roles based on the filtered roles
      this.setPaginatedRoles();
    }
  }

  user!: UserModel
  refresh(user: UserModel) {
    this.user = user;
  }

  edit_user(user: UserModel) {
    let dialogef = this.dialog.open(EditUserDialogComponent, {
      width: '900px',
      data: user,
      hasBackdrop: true,
    });
    dialogef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh(user);
      }
    });
  }

  refreshUser() {
    this.http
      .get(`${this.api.base_uri}users/${this.user?.id}`, {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.user = response.body;
        },
        error: (error: HttpErrorResponse) => {},
      });
  }
}
