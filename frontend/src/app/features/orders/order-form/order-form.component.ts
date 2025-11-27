import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ClientService } from '../../../core/services/client.service';
import { ProductService } from '../../../core/services/product.service';
import { Client } from '../../../core/models/client.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="order-form-container">
      <h1>Create Order</h1>

      <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
        <div class="form-section">
          <h3>Client Selection</h3>
          <div class="form-group">
            <label for="client_id">Client *</label>
            <select id="client_id" formControlName="client_id" class="form-control">
              <option value="">Select Client</option>
              <option *ngFor="let client of clients" [value]="client.id">
                {{ client.first_name }} {{ client.last_name }} - {{ client.email }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>Order Items</h3>
          <div formArrayName="items">
            <div
              *ngFor="let item of items.controls; let i = index"
              [formGroupName]="i"
              class="order-item"
            >
              <div class="item-fields">
                <div class="form-group">
                  <label>Product *</label>
                  <select formControlName="product_id" class="form-control">
                    <option value="">Select Product</option>
                    <option *ngFor="let product of products" [value]="product.id">
                      {{ product.name }} - \${{ product.price }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Quantity *</label>
                  <input type="number" formControlName="quantity" class="form-control" min="1" />
                </div>
                <button type="button" class="btn-remove" (click)="removeItem(i)">✕</button>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary" (click)="addItem()">+ Add Item</button>
        </div>

        <div class="form-section">
          <h3>Shipping Information</h3>
          <div class="form-group">
            <label for="shipping_address">Shipping Address *</label>
            <textarea
              id="shipping_address"
              formControlName="shipping_address"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" formControlName="notes" class="form-control" rows="3"></textarea>
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="orderForm.invalid || isLoading">
            {{ isLoading ? 'Creating...' : 'Create Order' }}
          </button>
          <a routerLink="/orders" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .order-form-container {
        max-width: 1000px;
        background: white;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        margin-bottom: 30px;
        color: #2c3e50;
      }

      .form-section {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .form-section h3 {
        margin: 0 0 15px 0;
        color: #2c3e50;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 600;
      }

      .form-control {
        width: 100%;
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .order-item {
        margin-bottom: 15px;
        padding: 15px;
        background: white;
        border-radius: 5px;
      }

      .item-fields {
        display: grid;
        grid-template-columns: 2fr 1fr auto;
        gap: 15px;
        align-items: end;
      }

      .btn-remove {
        padding: 10px 15px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
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

      .btn {
        padding: 12px 24px;
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

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);
  private router = inject(Router);

  orderForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  clients: Client[] = [];
  products: Product[] = [];

  constructor() {
    this.orderForm = this.fb.group({
      client_id: ['', Validators.required],
      items: this.fb.array([]),
      shipping_address: ['', Validators.required],
      notes: [''],
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();
    this.addItem();
  }

  loadClients(): void {
    this.clientService.getAllClients(1, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.clients = response.data || [];
        }
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

  addItem(): void {
    const itemGroup = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.orderService.createOrder(this.orderForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/orders']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create order';
        },
      });
    }
  }
}
