import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { Category, Brand, Gender, Color, Size } from '../../../core/models/reference-data.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="product-list-container">
      <div class="header">
        <h1>Products</h1>
        <a routerLink="/products/create" class="btn btn-primary">➕ Add Product</a>
      </div>

      <!-- ADVANCED SEARCH FILTERS -->
      <div class="advanced-filters">
        <h3>🔍 Advanced Search</h3>
        
        <div class="filters-grid">
          <!-- Text Search -->
          <div class="filter-group">
            <label>Search by Name</label>
            <input
              type="text"
              placeholder="Search products..."
              class="filter-input"
              [(ngModel)]="searchFilters.search"
            />
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label>Category</label>
            <select class="filter-select" [(ngModel)]="searchFilters.category">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Gender Filter -->
          <div class="filter-group">
            <label>Gender</label>
            <select class="filter-select" [(ngModel)]="searchFilters.gender">
              <option value="">All Genders</option>
              <option *ngFor="let gender of genders" [value]="gender.name">
                {{ gender.name }}
              </option>
            </select>
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <label>Brand</label>
            <select class="filter-select" [(ngModel)]="searchFilters.brand">
              <option value="">All Brands</option>
              <option *ngFor="let brand of brands" [value]="brand.name">
                {{ brand.name }}
              </option>
            </select>
          </div>

          <!-- Size Filter -->
          <div class="filter-group">
            <label>Size</label>
            <select class="filter-select" [(ngModel)]="searchFilters.size">
              <option value="">All Sizes</option>
              <option *ngFor="let size of sizes" [value]="size.name">
                {{ size.name }}
              </option>
            </select>
          </div>

          <!-- Color Filter -->
          <div class="filter-group">
            <label>Color</label>
            <select class="filter-select" [(ngModel)]="searchFilters.color">
              <option value="">All Colors</option>
              <option *ngFor="let color of colors" [value]="color.name">
                {{ color.name }}
              </option>
            </select>
          </div>

          <!-- Price Min -->
          <div class="filter-group">
            <label>Min Price ($)</label>
            <input
              type="number"
              placeholder="0"
              class="filter-input"
              [(ngModel)]="searchFilters.price_min"
              min="0"
              step="0.01"
            />
          </div>

          <!-- Price Max -->
          <div class="filter-group">
            <label>Max Price ($)</label>
            <input
              type="number"
              placeholder="1000"
              class="filter-input"
              [(ngModel)]="searchFilters.price_max"
              min="0"
              step="0.01"
            />
          </div>

          <!-- Availability Filter -->
          <div class="filter-group">
            <label>Availability</label>
            <select class="filter-select" [(ngModel)]="searchFilters.availability">
              <option value="">All Products</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-primary" (click)="applyFilters()" [disabled]="isLoading">
            🔍 Search
          </button>
          <button class="btn btn-secondary" (click)="clearFilters()" [disabled]="isLoading">
            ✖ Clear Filters
          </button>
        </div>

        <!-- Active Filters Display -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <span class="filter-label">Active Filters:</span>
          <span class="filter-tag" *ngIf="searchFilters.search">
            Search: {{ searchFilters.search }}
            <button class="remove-filter" (click)="removeFilter('search')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.category">
            Category: {{ searchFilters.category }}
            <button class="remove-filter" (click)="removeFilter('category')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.gender">
            Gender: {{ searchFilters.gender }}
            <button class="remove-filter" (click)="removeFilter('gender')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.brand">
            Brand: {{ searchFilters.brand }}
            <button class="remove-filter" (click)="removeFilter('brand')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.size">
            Size: {{ searchFilters.size }}
            <button class="remove-filter" (click)="removeFilter('size')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.color">
            Color: {{ searchFilters.color }}
            <button class="remove-filter" (click)="removeFilter('color')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.price_min !== null">
            Min: {{ '$' + searchFilters.price_min }}
            <button class="remove-filter" (click)="removeFilter('price_min')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.price_max !== null">
            Max: {{ '$' + searchFilters.price_max }}
            <button class="remove-filter" (click)="removeFilter('price_max')">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchFilters.availability">
            {{ searchFilters.availability === 'in_stock' ? 'In Stock' : 'Out of Stock' }}
            <button class="remove-filter" (click)="removeFilter('availability')">×</button>
          </span>
        </div>
      </div>

      <!-- PRODUCTS GRID -->
      <div class="products-grid" *ngIf="!isLoading">
        <div class="product-card" *ngFor="let product of products">
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
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="description">{{ product.description || 'No description' }}</p>
            <div class="product-details">
              <span class="detail-item" *ngIf="product.category_name">
                📁 {{ product.category_name }}
              </span>
              <span class="detail-item" *ngIf="product.brand_name">
                🏷️ {{ product.brand_name }}
              </span>
              <span class="detail-item" *ngIf="product.gender_name">
                👤 {{ product.gender_name }}
              </span>
              <span class="detail-item" *ngIf="product.size_name">
                📏 {{ product.size_name }}
              </span>
              <span class="detail-item" *ngIf="product.color_name">
                🎨 {{ product.color_name }}
              </span>
            </div>
            <div class="product-footer">
              <!-- ✅ Show discount badge if product has active discount -->
              <div class="price-section">
                <div *ngIf="product.has_discount" class="discount-badge">
                  <span *ngIf="product.discount_percentage">
                    {{ product.discount_percentage }}% OFF
                  </span>
                  <span *ngIf="product.discount_amount">
                    {{ '$' + product.discount_amount.toFixed(2) }} OFF
                  </span>
                </div>
                
                <!-- Original Price (crossed out if discount exists) -->
                <span class="price" [class.original-price]="product.has_discount">
                  \${{ product.price.toFixed(2) }}
                </span>
                
                <!-- Discounted Price (shown only if discount exists) -->
                <span *ngIf="product.has_discount" class="discounted-price">
                  \${{ product.discounted_price?.toFixed(2) }}
                </span>
              </div>
              
              <span class="stock" [class.out-of-stock]="(product.current_quantity || product.quantity) === 0">
                Stock: {{ product.current_quantity !== undefined ? product.current_quantity : product.quantity }}
              </span>
            </div>
            <div class="actions">
              <a [routerLink]="['/products', product.id]" class="btn btn-sm btn-info">View</a>
              <a [routerLink]="['/products', product.id, 'edit']" class="btn btn-sm btn-warning">
                Edit
              </a>
              <button
                *ngIf="authService.isAdmin"
                class="btn btn-sm btn-danger"
                (click)="deleteProduct(product.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <div class="empty-state" *ngIf="!isLoading && products.length === 0">
        <p>No products found</p>
        <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div class="pagination" *ngIf="pagination && pagination.totalPages > 1">
        <button
          class="btn btn-sm"
          [disabled]="pagination.page === 1"
          (click)="goToPage(pagination.page - 1)"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          <span class="total-items">({{ pagination.total }} products)</span>
        </span>
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
      .product-list-container {
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

      /* ADVANCED FILTERS STYLING */
      .advanced-filters {
        background: white;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .advanced-filters h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
        font-size: 20px;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
      }

      .filter-group label {
        margin-bottom: 5px;
        color: #555;
        font-weight: 600;
        font-size: 14px;
      }

      .filter-input,
      .filter-select {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      .filter-input:focus,
      .filter-select:focus {
        outline: none;
        border-color: #3498db;
      }

      .filter-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }

      .active-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        align-items: center;
      }

      .filter-label {
        font-weight: 600;
        color: #2c3e50;
        margin-right: 5px;
      }

      .filter-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        background: #3498db;
        color: white;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 500;
      }

      .remove-filter {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: 5px;
        line-height: 1;
      }

      .remove-filter:hover {
        opacity: 0.8;
      }

      /* PRODUCTS GRID */
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 25px;
      }

      .product-card {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, box-shadow 0.3s;
      }

      .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
      }

      .product-image {
        height: 200px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-size: cover;
        background-position: center;
        position: relative;
      }

      .status-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 12px;
        border-radius: 12px;
        font-size: 12px;
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

      .product-info {
        padding: 20px;
      }

      .product-info h3 {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-size: 18px;
      }

      .description {
        color: #7f8c8d;
        font-size: 14px;
        margin: 0 0 15px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
      }

      .detail-item {
        background: #f8f9fa;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        color: #555;
      }

      .product-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-top: 15px;
        border-top: 1px solid #e0e0e0;
      }

      /* ✅ Price section with discount */
      .price-section {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .discount-badge {
        background: #e74c3c;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        width: fit-content;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }

      .price {
        font-size: 24px;
        font-weight: 700;
        color: #27ae60;
      }

      /* Original price when discount exists */
      .original-price {
        font-size: 18px;
        color: #95a5a6;
        text-decoration: line-through;
      }

      /* Discounted price (prominent display) */
      .discounted-price {
        font-size: 28px;
        font-weight: 700;
        color: #27ae60;
      }

      .stock {
        color: #7f8c8d;
        font-size: 14px;
        font-weight: 600;
      }

      .stock.out-of-stock {
        color: #e74c3c;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2980b9;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #7f8c8d;
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

      .btn-info:hover {
        background: #2980b9;
      }

      .btn-warning:hover {
        background: #e67e22;
      }

      .btn-danger:hover {
        background: #c0392b;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* LOADING STATE */
      .loading {
        text-align: center;
        padding: 60px 20px;
        color: #7f8c8d;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* EMPTY STATE */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #7f8c8d;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .empty-state p {
        font-size: 18px;
        margin-bottom: 20px;
      }

      /* PAGINATION */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        margin-top: 40px;
        padding: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .page-info {
        color: #2c3e50;
        font-weight: 600;
      }

      .total-items {
        color: #7f8c8d;
        font-size: 14px;
        margin-left: 5px;
      }

      /* RESPONSIVE */
      @media (max-width: 768px) {
        .filters-grid {
          grid-template-columns: 1fr;
        }

        .products-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private refDataService = inject(ReferenceDataService);
  authService = inject(AuthService);

  products: Product[] = [];
  isLoading = false;
  pagination: any = null;
  currentPage = 1;
  limit = 12;

  // Reference data for filters
  categories: Category[] = [];
  brands: Brand[] = [];
  genders: Gender[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];

  // Search filters object with proper typing
  searchFilters = {
    search: '',
    category: '',
    gender: '',
    brand: '',
    size: '',
    color: '',
    price_min: null as number | null,
    price_max: null as number | null,
    availability: '',
  };

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadProducts();
  }

  loadReferenceData(): void {
    // Load categories
    this.refDataService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) this.categories = response.data || [];
      },
    });

    // Load brands
    this.refDataService.getAllBrands().subscribe({
      next: (response) => {
        if (response.success) this.brands = response.data || [];
      },
    });

    // Load genders
    this.refDataService.getAllGenders().subscribe({
      next: (response) => {
        if (response.success) this.genders = response.data || [];
      },
    });

    // Load colors
    this.refDataService.getAllColors().subscribe({
      next: (response) => {
        if (response.success) this.colors = response.data || [];
      },
    });

    // Load sizes
    this.refDataService.getAllSizes().subscribe({
      next: (response) => {
        if (response.success) this.sizes = response.data || [];
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    // If no filters are active, use regular getAllProducts
    if (!this.hasActiveFilters()) {
      this.productService.getAllProducts(this.currentPage, this.limit).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.products = response.data || [];
            this.pagination = response.pagination;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading products:', error);
        },
      });
    } else {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1; 

    const searchParams: any = {
      page: this.currentPage,
      limit: this.limit,
    };

    if (this.searchFilters.search) searchParams.search = this.searchFilters.search;
    if (this.searchFilters.category) searchParams.category = this.searchFilters.category;
    if (this.searchFilters.gender) searchParams.gender = this.searchFilters.gender;
    if (this.searchFilters.brand) searchParams.brand = this.searchFilters.brand;
    if (this.searchFilters.size) searchParams.size = this.searchFilters.size;
    if (this.searchFilters.color) searchParams.color = this.searchFilters.color;
    if (this.searchFilters.price_min !== null) searchParams.price_min = this.searchFilters.price_min;
    if (this.searchFilters.price_max !== null) searchParams.price_max = this.searchFilters.price_max;
    if (this.searchFilters.availability) searchParams.availability = this.searchFilters.availability;

    this.productService.searchProducts(searchParams).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.products = response.data || [];
          this.pagination = response.pagination;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error searching products:', error);
      },
    });
  }

  clearFilters(): void {
    this.searchFilters = {
      search: '',
      category: '',
      gender: '',
      brand: '',
      size: '',
      color: '',
      price_min: null as number | null,
      price_max: null as number | null,
      availability: '',
    };
    this.currentPage = 1;
    this.loadProducts();
  }

  removeFilter(filterKey: string): void {
    if (filterKey === 'price_min' || filterKey === 'price_max') {
      (this.searchFilters as any)[filterKey] = null;
    } else {
      (this.searchFilters as any)[filterKey] = '';
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      !!this.searchFilters.search ||
      !!this.searchFilters.category ||
      !!this.searchFilters.gender ||
      !!this.searchFilters.brand ||
      !!this.searchFilters.size ||
      !!this.searchFilters.color ||
      this.searchFilters.price_min !== null ||
      this.searchFilters.price_max !== null ||
      !!this.searchFilters.availability
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
    if (this.hasActiveFilters()) {
      this.applyFilters();
    } else {
      this.loadProducts();
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        },
      });
    }
  }
}