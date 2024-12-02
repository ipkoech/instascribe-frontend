import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.scss',
})
export class TeamManagementComponent {
  activeTab: string = 'overview'; // Default active tab

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  //users table
  searchQuery: string = '';
  filter: string = 'all';
  selectedUsers: any[] = [];
  users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      lastActive: '2 hours ago',
      dateAdded: '2023-01-15',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Editor',
      lastActive: '5 minutes ago',
      dateAdded: '2023-03-22',
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Viewer',
      lastActive: '1 day ago',
      dateAdded: '2023-06-10',
    },
  ];

  filteredUsers() {
    return this.users.filter((user) => {
      const matchesSearch = user.name
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesFilter =
        this.filter === 'all' ||
        (this.filter === 'active' && user.lastActive !== 'Inactive') ||
        (this.filter === 'inactive' && user.lastActive === 'Inactive');
      return matchesSearch && matchesFilter;
    });
  }

  toggleSelectUser(user: any) {
    if (this.selectedUsers.includes(user)) {
      this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    } else {
      this.selectedUsers.push(user);
    }
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedUsers = [...this.users];
    } else {
      this.selectedUsers = [];
    }
  }

  assignRole() {
    console.log('Assign role to:', this.selectedUsers);
  }

  deactivateUsers() {
    console.log('Deactivate users:', this.selectedUsers);
  }

  deleteSelectedUsers() {
    console.log('Delete selected users:', this.selectedUsers);
  }

  addNewUser() {
    console.log('Add new user clicked');
  }

  viewUser(user: any) {
    console.log('View user:', user);
  }

  editUser(user: any) {
    console.log('Edit user:', user);
  }

  deleteUser(user: any) {
    console.log('Delete user:', user);
  }

  //roles
  roles_searchQuery: string = '';
  roles = [
    { name: 'Admin', users: 5, permissions: 15 },
    { name: 'Editor', users: 10, permissions: 10 },
    { name: 'Viewer', users: 20, permissions: 5 },
  ];

  filteredRoles() {
    return this.roles.filter((role) =>
      role.name.toLowerCase().includes(this.roles_searchQuery.toLowerCase())
    );
  }

  createNewRole() {
    console.log('Create New Role clicked');
  }

  viewRole(role: any) {
    console.log('View role:', role);
  }

  editRole(role: any) {
    console.log('Edit role:', role);
  }

  deleteRole(role: any) {
    console.log('Delete role:', role);
  }
}
