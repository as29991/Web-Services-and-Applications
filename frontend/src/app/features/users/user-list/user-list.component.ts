import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-container">
      <div class="header">
        <h1>User Management</h1>
        <button class="btn btn-primary" (click)="showCreateForm = true">➕ Add User</button>
      </div>

      <div class="user-form" *ngIf="showCreateForm">
        <h3>Create New User</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Username *</label>
            <input type="text" [(ngModel)]="newUser.username" class="form-control" />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="newUser.email" class="form-control" />
          </div>

          <div class="form-group">
            <label>Password *</label>
            <input type="password" [(ngModel)]="newUser.password" class="form-control" />
          </div>

          <div class="form-group">
            <label>Role *</label>
            <select [(ngModel)]="newUser.role" class="form-control">
              <option value="">Select Role</option>
              <option *ngFor="let role of roles" [value]="role.name">{{ role.name }}</option>
            </select>
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="form-actions">
          <button class="btn btn-primary" (click)="createUser()" [disabled]="isLoading">
            {{ isLoading ? 'Creating...' : 'Create User' }}
          </button>
          <button class="btn btn-secondary" (click)="cancelCreate()">Cancel</button>
        </div>
      </div>

      <div class="user-form" *ngIf="showEditForm && editingUser">
        <h3>Edit User</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="editingUser.username" class="form-control" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="editingUser.email" class="form-control" />
          </div>

          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="editingUser.role" class="form-control">
              <option *ngFor="let role of roles" [value]="role.name">{{ role.name }}</option>
            </select>
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="form-actions">
          <button class="btn btn-primary" (click)="updateUser()" [disabled]="isLoading">
            {{ isLoading ? 'Updating...' : 'Update User' }}
          </button>
          <button class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
        </div>
      </div>

      <div class="user-form" *ngIf="showResetPasswordForm && resetPasswordUserId">
        <h3>Reset Password</h3>
        <div class="form-group">
          <label>New Password *</label>
          <input type="password" [(ngModel)]="newPassword" class="form-control" />
        </div>

        <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="form-actions">
          <button class="btn btn-primary" (click)="resetPassword()" [disabled]="isLoading">
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
          <button class="btn btn-secondary" (click)="cancelResetPassword()">Cancel</button>
        </div>
      </div>

      <div class="users-table" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.active]="user.is_active">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.created_at | date : 'short' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-warning" (click)="editUser(user)">Edit</button>
                  <button class="btn btn-sm btn-info" (click)="showResetPasswordDialog(user.id)">
                    Reset Pass
                  </button>
                  <button
                    class="btn btn-sm"
                    [class.btn-success]="!user.is_active"
                    [class.btn-secondary]="user.is_active"
                    (click)="toggleUserStatus(user.id)"
                  >
                    {{ user.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteUser(user.id)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="isLoading">Loading users...</div>
      <div class="empty-state" *ngIf="!isLoading && users.length === 0">No users found</div>

      <div class="pagination" *ngIf="pagination && pagination.totalPages > 1">
        <button
          class="btn btn-sm"
          [disabled]="pagination.page === 1"
          (click)="goToPage(pagination.page - 1)"
        >
          Previous
        </button>
        <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
        <button
          class="btn btn-sm"
          [disabled]="pagination.page === pagination.totalPages"
          (click)="goToPage(pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .user-container {
        max-width: 1400px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      h1 {
        font-size: 32px;
        color: #2c3e50;
        margin: 0;
      }

      .user-form {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .user-form h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      label {
        margin-bottom: 5px;
        color: #555;
        font-weight: 600;
      }

      .form-control {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
      }

      .error-message {
        color: #e74c3c;
        padding: 10px;
        background: #fee;
        border-radius: 5px;
        margin-bottom: 20px;
      }

      .form-actions {
        display: flex;
        gap: 10px;
      }

      .users-table {
        background: white;
        border-radius: 10px;
        overflow-x: auto;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        background: #f8f9fa;
        padding: 15px;
        text-align: left;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #e0e0e0;
      }

      td {
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
      }

      tr:hover {
        background: #f8f9fa;
      }

      .role-badge {
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .role-admin {
        background: #e74c3c;
        color: white;
      }

      .role-advanced_user {
        background: #3498db;
        color: white;
      }

      .role-simple_user {
        background: #95a5a6;
        color: white;
      }

      .status-badge {
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        background: #e74c3c;
        color: white;
      }

      .status-badge.active {
        background: #27ae60;
      }

      .action-buttons {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .btn-success {
        background: #27ae60;
        color: white;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
      }

      .btn-warning {
        background: #f39c12;
        color: white;
      }

      .btn-info {
        background: #3498db;
        color: white;
      }

      .btn-danger {
        background: #e74c3c;
        color: white;
      }

      .loading,
      .empty-state {
        text-align: center;
        padding: 40px;
        color: #7f8c8d;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-top: 30px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  roles: Role[] = [];
  isLoading = false;
  showCreateForm = false;
  showEditForm = false;
  showResetPasswordForm = false;
  pagination: any = null;
  currentPage = 1;
  limit = 20;
  errorMessage = '';
  editingUser: any = null;
  resetPasswordUserId: number | null = null;
  newPassword = '';

  newUser = {
    username: '',
    email: '',
    password: '',
    role: '',
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.users = response.data || [];
          this.pagination = response.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading users:', error);
      },
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles = response.data || [];
        }
      },
    });
  }

  createUser(): void {
    this.errorMessage = '';

    if (
      !this.newUser.username ||
      !this.newUser.email ||
      !this.newUser.password ||
      !this.newUser.role
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;

    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.cancelCreate();
          this.loadUsers();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create user';
      },
    });
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
    this.showEditForm = true;
    this.showCreateForm = false;
    this.showResetPasswordForm = false;
  }

  updateUser(): void {
    if (!this.editingUser) return;

    this.errorMessage = '';
    this.isLoading = true;

    this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.cancelEdit();
          this.loadUsers();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update user';
      },
    });
  }

  showResetPasswordDialog(userId: number): void {
    this.resetPasswordUserId = userId;
    this.showResetPasswordForm = true;
    this.showCreateForm = false;
    this.showEditForm = false;
    this.newPassword = '';
  }

  resetPassword(): void {
    if (!this.resetPasswordUserId || !this.newPassword) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.userService.resetUserPassword(this.resetPasswordUserId, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          alert('Password reset successfully');
          this.cancelResetPassword();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password';
      },
    });
  }

  toggleUserStatus(userId: number): void {
    this.userService.toggleUserStatus(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        alert(error.error?.message || 'Failed to toggle user status');
      },
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert(error.error?.message || 'Failed to delete user');
        },
      });
    }
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: '',
    };
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingUser = null;
    this.errorMessage = '';
  }

  cancelResetPassword(): void {
    this.showResetPasswordForm = false;
    this.resetPasswordUserId = null;
    this.newPassword = '';
    this.errorMessage = '';
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
}
