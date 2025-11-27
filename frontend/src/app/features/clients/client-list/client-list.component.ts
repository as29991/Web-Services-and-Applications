import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="client-list-container">
      <div class="header">
        <h1>Clients</h1>
        <a routerLink="/clients/create" class="btn btn-primary">➕ Add Client</a>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Search clients by name, email, or phone..."
          class="search-input"
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
        />
      </div>

      <div class="clients-table" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of clients">
              <td>{{ client.first_name }} {{ client.last_name }}</td>
              <td>{{ client.email }}</td>
              <td>{{ client.phone || '-' }}</td>
              <td>{{ client.city || '-' }}</td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/clients', client.id]" class="btn btn-sm btn-info">View</a>
                  <a [routerLink]="['/clients', client.id, 'edit']" class="btn btn-sm btn-warning"
                    >Edit</a
                  >
                  <button class="btn btn-sm btn-danger" (click)="deleteClient(client.id)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="isLoading">Loading clients...</div>
      <div class="empty-state" *ngIf="!isLoading && clients.length === 0">No clients found</div>

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
      .client-list-container {
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

      .search-bar {
        margin-bottom: 20px;
      }

      .search-input {
        width: 100%;
        padding: 12px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
      }

      .clients-table {
        background: white;
        border-radius: 10px;
        overflow: hidden;
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

      .action-buttons {
        display: flex;
        gap: 5px;
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

      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
      }

      .btn-info {
        background: #3498db;
        color: white;
      }

      .btn-warning {
        background: #f39c12;
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
    `,
  ],
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);

  clients: Client[] = [];
  isLoading = false;
  searchTerm = '';
  pagination: any = null;
  currentPage = 1;
  limit = 20;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients(this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.clients = response.data || [];
          this.pagination = response.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading clients:', error);
      },
    });
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.clientService.searchClients(this.searchTerm, 1, this.limit).subscribe({
        next: (response) => {
          if (response.success) {
            this.clients = response.data || [];
            this.pagination = response.pagination;
          }
        },
      });
    } else {
      this.loadClients();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    if (this.searchTerm.trim()) {
      this.onSearch();
    } else {
      this.loadClients();
    }
  }

  deleteClient(id: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.deleteClient(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadClients();
          }
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          alert(error.error?.message || 'Failed to delete client');
        },
      });
    }
  }
}
