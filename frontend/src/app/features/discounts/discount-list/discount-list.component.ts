import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscountService } from '../../../core/services/discount.service';
import { ProductService } from '../../../core/services/product.service';
import { Discount } from '../../../core/models/discount.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-discount-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="discount-container">
      <div class="header">
        <h1>Discounts</h1>
        <button class="btn btn-primary" (click)="showCreateForm = true">➕ Add Discount</button>
      </div>

      <div class="filters">
        <select class="filter-select" [(ngModel)]="activeFilter" (change)="onFilterChange()">
          <option value="">All Discounts</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      <div class="discount-form" *ngIf="showCreateForm">
        <h3>Create New Discount</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Product *</label>
            <select [(ngModel)]="newDiscount.product_id" class="form-control">
              <option value="">Select Product</option>
              <option *ngFor="let product of products" [value]="product.id">
                {{ product.name }} - \${{ product.price }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Discount Type</label>
            <select
              [(ngModel)]="discountType"
              class="form-control"
              (change)="onDiscountTypeChange()"
            >
              <option value="percentage">Percentage</option>
              <option value="amount">Fixed Amount</option>
            </select>
          </div>

          <div class="form-group" *ngIf="discountType === 'percentage'">
            <label>Discount Percentage (%) *</label>
            <input
              type="number"
              [(ngModel)]="newDiscount.discount_percentage"
              class="form-control"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div class="form-group" *ngIf="discountType === 'amount'">
            <label>Discount Amount ($) *</label>
            <input
              type="number"
              [(ngModel)]="newDiscount.discount_amount"
              class="form-control"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label>Start Date *</label>
            <input
              type="datetime-local"
              [(ngModel)]="newDiscount.start_date"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>End Date *</label>
            <input type="datetime-local" [(ngModel)]="newDiscount.end_date" class="form-control" />
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="form-actions">
          <button class="btn btn-primary" (click)="createDiscount()" [disabled]="isLoading">
            {{ isLoading ? 'Creating...' : 'Create Discount' }}
          </button>
          <button class="btn btn-secondary" (click)="cancelCreate()">Cancel</button>
        </div>
      </div>

      <div class="discounts-table" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Value</th>
              <th>Original Price</th>
              <th>Discounted Price</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let discount of discounts">
              <td>{{ discount.product_name }}</td>
              <td>{{ discount.discount_percentage ? 'Percentage' : 'Fixed Amount' }}</td>
              <td>
                <span *ngIf="discount.discount_percentage"
                  >{{ discount.discount_percentage }}%</span
                >
                <span *ngIf="discount.discount_amount"
                  >\${{ discount.discount_amount.toFixed(2) }}</span
                >
              </td>
              <td>\${{ discount.product_price?.toFixed(2) }}</td>
              <td class="discounted-price">
                \${{ calculateDiscountedPrice(discount).toFixed(2) }}
              </td>
              <td>{{ discount.start_date | date : 'short' }}</td>
              <td>{{ discount.end_date | date : 'short' }}</td>
              <td>
                <span class="status-badge" [class.active]="discount.is_active">
                  {{ discount.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn btn-sm btn-warning"
                    (click)="deactivateDiscount(discount.id)"
                    *ngIf="discount.is_active"
                  >
                    Deactivate
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteDiscount(discount.id)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="loading" *ngIf="isLoading">Loading discounts...</div>
      <div class="empty-state" *ngIf="!isLoading && discounts.length === 0">No discounts found</div>

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
      .discount-container {
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

      .discount-form {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .discount-form h3 {
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

      .discounts-table {
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
        white-space: nowrap;
      }

      td {
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
      }

      tr:hover {
        background: #f8f9fa;
      }

      .discounted-price {
        color: #27ae60;
        font-weight: 700;
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

      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
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

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class DiscountListComponent implements OnInit {
  private discountService = inject(DiscountService);
  private productService = inject(ProductService);

  discounts: Discount[] = [];
  products: Product[] = [];
  isLoading = false;
  showCreateForm = false;
  activeFilter = '';
  pagination: any = null;
  currentPage = 1;
  limit = 20;
  errorMessage = '';
  discountType = 'percentage';

  newDiscount: any = {
    product_id: '',
    discount_percentage: null,
    discount_amount: null,
    start_date: '',
    end_date: '',
  };

  ngOnInit(): void {
    this.loadDiscounts();
    this.loadProducts();
  }

  loadDiscounts(): void {
    this.isLoading = true;
    const is_active = this.activeFilter === '' ? undefined : this.activeFilter === 'true';

    this.discountService.getAllDiscounts(this.currentPage, this.limit, is_active).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.discounts = response.data || [];
          this.pagination = response.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading discounts:', error);
      },
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts(1, 100, true).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data || [];
        }
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDiscounts();
  }

  onDiscountTypeChange(): void {
    if (this.discountType === 'percentage') {
      this.newDiscount.discount_amount = null;
    } else {
      this.newDiscount.discount_percentage = null;
    }
  }

  createDiscount(): void {
  this.errorMessage = '';

  // Validate required fields
  if (
    !this.newDiscount.product_id ||
    !this.newDiscount.start_date ||
    !this.newDiscount.end_date
  ) {
    this.errorMessage = 'Please fill in all required fields';
    return;
  }

  // Validate discount value
  if (!this.newDiscount.discount_percentage && !this.newDiscount.discount_amount) {
    this.errorMessage = 'Please specify either discount percentage or amount';
    return;
  }

  this.isLoading = true;

  // ✅ Convert all values to proper types
  const discountData = {
    product_id: Number(this.newDiscount.product_id),  
    discount_percentage: this.newDiscount.discount_percentage 
      ? Number(this.newDiscount.discount_percentage) 
      : undefined,
    discount_amount: this.newDiscount.discount_amount 
      ? Number(this.newDiscount.discount_amount) 
      : undefined,
    start_date: this.newDiscount.start_date,
    end_date: this.newDiscount.end_date,
  };

  console.log('Sending discount data:', discountData);  

  this.discountService.applyDiscount(discountData).subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response.success) {
        alert('Discount created successfully!');
        this.cancelCreate();
        this.loadDiscounts();
      }
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.error?.message || 'Failed to create discount';
      console.error('Create discount error:', error);
    },
  });
}

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newDiscount = {
      product_id: '',
      discount_percentage: null,
      discount_amount: null,
      start_date: '',
      end_date: '',
    };
    this.errorMessage = '';
  }

  calculateDiscountedPrice(discount: Discount): number {
    const price = discount.product_price || 0;
    if (discount.discount_amount) {
      return price - discount.discount_amount;
    } else if (discount.discount_percentage) {
      return price * (1 - discount.discount_percentage / 100);
    }
    return price;
  }

  deactivateDiscount(id: number): void {
    if (confirm('Deactivate this discount?')) {
      this.discountService.deactivateDiscount(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDiscounts();
          }
        },
        error: (error) => {
          console.error('Error deactivating discount:', error);
          alert('Failed to deactivate discount');
        },
      });
    }
  }

  deleteDiscount(id: number): void {
    if (confirm('Are you sure you want to delete this discount?')) {
      this.discountService.deleteDiscount(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDiscounts();
          }
        },
        error: (error) => {
          console.error('Error deleting discount:', error);
          alert('Failed to delete discount');
        },
      });
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadDiscounts();
  }
}
