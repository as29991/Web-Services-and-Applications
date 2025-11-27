import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductQuantity } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-detail" *ngIf="product">
      <div class="header">
        <h1>{{ product.name }}</h1>
        <div class="actions">
          <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-warning">Edit</a>
          <a routerLink="/products" class="btn btn-secondary">Back to List</a>
        </div>
      </div>

      <div class="product-content">
        <div class="product-image-section">
          <div
            class="product-image"
            [style.background-image]="product.image_url ? 'url(' + product.image_url + ')' : 'none'"
          >
            <span
              class="status-badge"
              [class.active]="product.is_active"
              [class.inactive]="!product.is_active"
            >
              {{ product.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="product-info-section">
          <div class="info-group">
            <h3>Basic Information</h3>
            <div class="info-row">
              <span class="label">Price:</span>
              <span class="value price">\${{ product.price.toFixed(2) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Initial Stock:</span>
              <span class="value">{{ product.quantity }}</span>
            </div>
            <div class="info-row" *ngIf="productQuantity">
              <span class="label">Current Stock:</span>
              <span class="value stock">{{ productQuantity.current_quantity }}</span>
            </div>
            <div class="info-row" *ngIf="productQuantity">
              <span class="label">Sold:</span>
              <span class="value">{{ productQuantity.sold_quantity }}</span>
            </div>
          </div>

          <div class="info-group" *ngIf="product.description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="info-group">
            <h3>Product Details</h3>
            <div class="info-row" *ngIf="product.category_name">
              <span class="label">Category:</span>
              <span class="value">{{ product.category_name }}</span>
            </div>
            <div class="info-row" *ngIf="product.brand_name">
              <span class="label">Brand:</span>
              <span class="value">{{ product.brand_name }}</span>
            </div>
            <div class="info-row" *ngIf="product.gender_name">
              <span class="label">Gender:</span>
              <span class="value">{{ product.gender_name }}</span>
            </div>
            <div class="info-row" *ngIf="product.size_name">
              <span class="label">Size:</span>
              <span class="value">{{ product.size_name }}</span>
            </div>
            <div class="info-row" *ngIf="product.color_name">
              <span class="label">Color:</span>
              <span class="value">{{ product.color_name }}</span>
            </div>
          </div>

          <div class="info-group">
            <h3>Timestamps</h3>
            <div class="info-row">
              <span class="label">Created:</span>
              <span class="value">{{ product.created_at | date : 'medium' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Updated:</span>
              <span class="value">{{ product.updated_at | date : 'medium' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .product-detail {
        max-width: 1200px;
        background: white;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
      }

      h1 {
        font-size: 32px;
        color: #2c3e50;
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 10px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }

      .btn-warning {
        background: #f39c12;
        color: white;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .product-content {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 40px;
      }

      .product-image {
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: cover;
        background-position: center;
        border-radius: 10px;
        position: relative;
      }

      .status-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
      }

      .status-badge.active {
        background: #27ae60;
        color: white;
      }

      .status-badge.inactive {
        background: #e74c3c;
        color: white;
      }

      .info-group {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .info-group h3 {
        margin: 0 0 15px 0;
        color: #2c3e50;
        font-size: 18px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e0e0e0;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .label {
        color: #7f8c8d;
        font-weight: 600;
      }

      .value {
        color: #2c3e50;
      }

      .price {
        font-size: 24px;
        font-weight: 700;
        color: #27ae60;
      }

      .stock {
        font-weight: 700;
        color: #3498db;
      }

      @media (max-width: 768px) {
        .product-content {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product: Product | null = null;
  productQuantity: ProductQuantity | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
      this.loadProductQuantity(id);
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
        }
      },
      error: (error) => console.error('Error loading product:', error),
    });
  }

  loadProductQuantity(id: number): void {
    this.productService.getProductQuantity(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productQuantity = response.data;
        }
      },
      error: (error) => console.error('Error loading product quantity:', error),
    });
  }
}
