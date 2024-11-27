import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PermissionsResponse } from '../../../core/interfaces/permission.model';
import { RoleModel, RolesResponse } from '../../../core/interfaces/role.model';
import { ApiService } from '../../../core/services/api.service';
import { AddRoleDialogComponent } from '../add-role-dialog/add-role-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    MatCheckboxModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatListModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    RouterModule,
    MatPaginatorModule,
    MatTableModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent {
  // roles: RolesResponse | undefined;
  // permissions: PermissionsResponse | undefined;

  // constructor(
  //   private dialog: MatDialog,
  //   private http: HttpClient,
  //   private snack: MatSnackBar,
  //   private api: ApiService,
  //   private cdr: ChangeDetectorRef
  // ) {
  //   this.get_roles(`${this.api.base_uri}roles`);
  // }

  // get_roles(url: string) {
  //   this.http
  //     .get(url, {
  //       observe: 'response',
  //       withCredentials: true,
  //       params: new HttpParams()
  //         .append('per_page', -1)
  //         .append('order_by', 'created_at desc')
  //         .append('include', 'permissions'),
  //     })
  //     .subscribe({
  //       next: (response: HttpResponse<any>) => {
  //         this.roles = response.body;
  //         this.cdr.detectChanges();
  //       },
  //     });
  // }

  roles: RolesResponse | undefined;
  permissions: PermissionsResponse | undefined;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private snack: MatSnackBar,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.get_roles(`${this.api.base_uri}roles`);
    this.get_permissions(`${this.api.base_uri}permissions`);
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
        next: (response: HttpResponse<any>) => {},
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
      width: '400px',
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
}
