import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  PermissionsResponse,
  PermissionModel,
} from '../../../core/interfaces/permission.model';
import { RoleModel } from '../../../core/interfaces/role.model';
import { ApiService } from '../../../core/services/api.service';
import { RoleService } from '../../../core/services/role.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BreadCrumbComponent } from '../../shared/bread-crumb/bread-crumb.component';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatListModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    BreadCrumbComponent,
  ],
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.scss',
})
export class RoleDetailComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('addUsersDialog') addUsersDialog!: TemplateRef<any>;
  @ViewChild('confirmPermissionDialog')
  confirmPermissionDialog!: TemplateRef<any>;

  role: RoleModel | undefined;
  permissions: PermissionsResponse | undefined;
  users: any;
  perPage: number = 10;
  searchTerm: string = '';
  filteredPermissions: PermissionModel[] = [];
  selectAllPermissions: boolean = false;
  selectedUserIds: string[] = [];

  constructor(
    private activateRoute: ActivatedRoute,
    private http: HttpClient,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private roleService: RoleService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.activateRoute.params.subscribe((params) => {
      this.role_id = params['id'];

      // this.role = role;
      if (this.role_id) {
        this.getRole(this.role_id);
        this.getPermissions();
      }
    });
  }
  role_id!: string;
  getPermissions() {
    const params = new HttpParams()
      .set('per_page', -1)
      .set('order_by', 'name asc');

    this.http
      .get(`${this.api.base_uri}permissions`, {
        withCredentials: true,
        observe: 'response',
        params,
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          this.permissions = response.body;
          if (this.permissions)
            this.filteredPermissions = this.permissions.data;
          this.filterPermissions();
          this.selectAllPermissions = this.areAllPermissionsSelected();
        },
        error: () => {
          this.snackBar.open('Failed to load permissions.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  hasPermission(role: RoleModel, permissionId: string): boolean {
    return role.permissions.some(
      (permission) => permission.id === permissionId
    );
  }
  getRole(role_id: string) {
    this.roleService.fetchRole(role_id).subscribe({
      next: (response: HttpResponse<any>) => {
        this.role = response.body;
        // Set breadcrumbs
        if (this.role) {
          this.breadcrumbService.setBreadcrumbs([
            {
              label: 'Team Management',
              url: '/team-management',
              icon: 'group',
            },
            // { label: 'Roles', url: '/team-management/roles', icon: 'security' },
            { label: this.role.name, url: '', icon: 'lock' }, // Current role (not a link)
          ]);
        }
      },
      error: (err) => {},
    });
  }

  onPermissionSelectionChange(event: MatSelectionListChange) {
    // Do nothing here; handled in confirmation dialog
  }

  openConfirmPermissionDialog(permission: PermissionModel) {
    const hasPerm = this.hasPermission(this.role!, permission.id);
    const action = hasPerm ? 'remove' : 'add';
    this.dialog.open(this.confirmPermissionDialog, {
      data: {
        action,
        permission,
        isSelectAll: false,
      },
      hasBackdrop: true,
    });
  }

  confirmPermissionChange(data: any) {
    if (data.isSelectAll) {
      if (data.action.includes('add')) {
        this.addPermissions(data.permissionIds);
      } else {
        this.removePermissions(data.permissionIds);
      }
    } else {
      if (data.action === 'add') {
        this.addPermissions([data.permission.id]);
      } else {
        this.removePermissions([data.permission.id]);
      }
    }
  }

  addPermissions(permissionIds: string[]) {
    this.http
      .post(`${this.api.base_uri}roles/${this.role?.id}/attach-permissions`, {
        permission_ids: permissionIds,
      })
      .subscribe({
        next: () => {
          const newPermissions = this.permissions?.data.filter((perm) =>
            permissionIds.includes(perm.id)
          );
          if (newPermissions) {
            this.role!.permissions.push(...newPermissions);
          }
          this.snackBar.open('Permissions added.', 'Close', { duration: 2000 });
          this.selectAllPermissions = this.areAllPermissionsSelected();
        },
        error: () => {
          this.snackBar.open('Failed to add permissions.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  removePermissions(permissionIds: string[]) {
    this.http
      .request(
        'delete',
        `${this.api.base_uri}roles/${this.role?.id}/revoke-permissions`,
        {
          body: { permission_ids: permissionIds },
        }
      )
      .subscribe({
        next: () => {
          this.role!.permissions = this.role!.permissions.filter(
            (permission) => !permissionIds.includes(permission.id)
          );
          this.snackBar.open('Permissions removed.', 'Close', {
            duration: 2000,
          });
          this.selectAllPermissions = this.areAllPermissionsSelected();
        },
        error: () => {
          this.snackBar.open('Failed to remove permissions.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onSelectAllPermissions(event: MatCheckboxChange) {
    const allPermissionIds = this.filteredPermissions.map((perm) => perm.id);
    if (event.checked) {
      // Open confirmation dialog
      this.dialog.open(this.confirmPermissionDialog, {
        data: {
          action: 'add all',
          permission: { name: 'permissions' },
          isSelectAll: true,
          permissionIds: allPermissionIds,
        },
        hasBackdrop: true,
      });
    } else {
      // Open confirmation dialog
      this.dialog.open(this.confirmPermissionDialog, {
        data: {
          action: 'remove all',
          permission: { name: 'permissions' },
          isSelectAll: true,
          permissionIds: allPermissionIds,
        },
        hasBackdrop: true,
      });
    }
  }

  areAllPermissionsSelected(): boolean {
    return this.filteredPermissions.every((perm) =>
      this.hasPermission(this.role!, perm.id)
    );
  }

  openAddUsersDialog() {
    this.selectedUserIds = [];
    this.loadUsers();
    this.dialog.open(this.addUsersDialog, {
      hasBackdrop: true,
    });
  }

  loadUsers() {
    this.http
      .get<any>(`${this.api.base_uri}users`, {
        withCredentials: true,
        observe: 'response',
        params: new HttpParams().append('per_page', -1),
      })
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.ok) this.users = response.body;
        },
        error: () => {
          this.snackBar.open('Failed to load users.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  isUserAlreadyInRole(userId: string): boolean {
    return this.role?.users.some((user) => user.id === userId) || false;
  }

  confirmAddUsers() {
    this.http
      .post(`${this.api.base_uri}roles/${this.role?.id}/users`, {
        user_ids: this.selectedUserIds,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Users added to the role.', 'Close', {
            duration: 3000,
          });
          // Update the role's users
          const addedUsers = this.users?.data.filter((user: any) =>
            this.selectedUserIds.includes(user.id)
          );
          this.role!.users.push(...addedUsers);
          this.dialog.closeAll();
        },
        error: () => {
          this.snackBar.open('Failed to add users.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex + 1;
    this.getPermissions();
  }

  filterPermissions() {
    if (this.permissions) {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredPermissions = this.permissions.data.filter((permission) =>
        permission.name.toLowerCase().includes(searchTermLower)
      );
    }
  }
}
