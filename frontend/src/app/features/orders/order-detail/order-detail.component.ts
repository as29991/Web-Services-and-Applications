import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="order-detail" *ngIf="order">
      <div class="header">
        <h1>Order {{ order.order_number }}</h1>
        <a routerLink="/orders" class="btn btn-secondary">Back to Orders</a>
      </div>

      <div class="order-info-grid">
        <div class="info-card">
          <h3>Order Information</h3>
          <div class="info-row">
            <span class="label">Order Number:</span>
            <span class="value">{{ order.order_number }}</span>
          </div>
          <div class="info-row">
            <span class="label">Order Date:</span>
            <span class="value">{{ order.order_date | date : 'medium' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge" [class]="'status-' + order.status">{{ order.status }}</span>
          </div>
          <div class="info-row">
            <span class="label">Total Amount:</span>
            <span class="value price">\${{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Client Information</h3>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">{{ order.first_name }} {{ order.last_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ order.client_email }}</span>
          </div>
        </div>

        <div class="info-card full-width">
          <h3>Shipping Address</h3>
          <p>{{ order.shipping_address }}</p>
        </div>

        <div class="info-card full-width" *ngIf="order.notes">
          <h3>Notes</h3>
          <p>{{ order.notes }}</p>
        </div>
      </div>

      <div class="order-items" *ngIf="order.items && order.items.length > 0">
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of order.items">
              <td>{{ item.product_name }}</td>
              <td>{{ item.quantity }}</td>
              <td>\${{ item.unit_price.toFixed(2) }}</td>
              <td>\${{ item.discount_applied.toFixed(2) }}</td>
              <td>\${{ item.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right"><strong>Total:</strong></td>
              <td>
                <strong>\${{ order.total_amount.toFixed(2) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="actions" *ngIf="authService.hasRole(['admin', 'advanced_user'])">
        <h3>Update Order Status</h3>
        <div class="status-buttons">
          <button
            class="btn btn-sm"
            (click)="updateStatus('confirmed')"
            [disabled]="order.status === 'confirmed'"
          >
            Confirm
          </button>
          <button
            class="btn btn-sm"
            (click)="updateStatus('processing')"
            [disabled]="order.status === 'processing'"
          >
            Processing
          </button>
          <button
            class="btn btn-sm"
            (click)="updateStatus('shipped')"
            [disabled]="order.status === 'shipped'"
          >
            Shipped
          </button>
          <button
            class="btn btn-sm"
            (click)="updateStatus('delivered')"
            [disabled]="order.status === 'delivered'"
          >
            Delivered
          </button>
          <button
            class="btn btn-sm btn-danger"
            (click)="cancelOrder()"
            [disabled]="['shipped', 'delivered', 'cancelled'].includes(order.status)"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .order-detail {
        max-width: 1200px;
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

      .order-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }

      .info-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .info-card.full-width {
        grid-column: 1 / -1;
      }

      .info-card h3 {
        margin: 0 0 15px 0;
        color: #2c3e50;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e0e0e0;
      }

      .label {
        color: #7f8c8d;
        font-weight: 600;
      }

      .value {
        color: #2c3e50;
      }

      .price {
        font-size: 20px;
        font-weight: 700;
        color: #27ae60;
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

      .order-items {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
      }

      tfoot td {
        font-size: 18px;
      }

      .text-right {
        text-align: right;
      }

      .actions {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .status-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        background: #3498db;
        color: white;
      }

      .btn-danger {
        background: #e74c3c;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
        text-decoration: none;
        display: inline-block;
      }
    `,
  ],
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  authService = inject(AuthService);

  order: Order | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order = response.data;
        }
      },
      error: (error) => console.error('Error loading order:', error),
    });
  }

  updateStatus(status: string): void {
    if (this.order && confirm(`Update order status to ${status}?`)) {
      this.orderService.updateOrderStatus(this.order.id, status).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.order = response.data;
            this.loadOrder(this.order.id);
          }
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status');
        },
      });
    }
  }

  cancelOrder(): void {
    if (this.order && confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.order = response.data;
            this.loadOrder(this.order.id);
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order');
        },
      });
    }
  }
}
