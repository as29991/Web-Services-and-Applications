import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="order-list-container">
      <div class="header">
        <h1>Orders</h1>
        <a routerLink="/orders/create" class="btn btn-primary">Create Order</a>
      </div>

      <div class="filters">
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="onFilterChange()">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="orders-table" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>{{ order.order_number }}</td>
              <td>{{ order.first_name }} {{ order.last_name }}</td>
              <td>{{ order.order_date | date : 'short' }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + order.status">
                  {{ order.status }}
                </span>
              </td>
              <td>\${{ order.total_amount.toFixed(2) }}</td>
              <td>
                <a [routerLink]="['/orders', order.id]" class="btn btn-sm btn-info">View</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="isLoading">Loading orders...</div>
      <div class="empty-state" *ngIf="!isLoading && orders.length === 0">No orders found</div>

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
      .order-list-container {
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

      .filters {
        margin-bottom: 20px;
      }

      .filter-select {
        padding: 10px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
      }

      .orders-table {
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

      .status-badge {
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-pending {
        background: #f39c12;
        color: white;
      }
      .status-confirmed {
        background: #3498db;
        color: white;
      }
      .status-processing {
        background: #9b59b6;
        color: white;
      }
      .status-shipped {
        background: #1abc9c;
        color: white;
      }
      .status-delivered {
        background: #27ae60;
        color: white;
      }
      .status-cancelled {
        background: #e74c3c;
        color: white;
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
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  isLoading = false;
  statusFilter = '';
  pagination: any = null;
  currentPage = 1;
  limit = 20;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const status = this.statusFilter || undefined;

    this.orderService.getAllOrders(this.currentPage, this.limit, status).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.orders = response.data || [];
          this.pagination = response.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
}
