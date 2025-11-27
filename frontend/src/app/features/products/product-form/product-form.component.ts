import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { Category, Brand, Gender, Color, Size } from '../../../core/models/reference-data.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="product-form-container">
      <h1>{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h1>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Product Name *</label>
            <input type="text" id="name" formControlName="name" class="form-control" />
            <div
              class="error"
              *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched"
            >
              Name is required
            </div>
          </div>

          <div class="form-group">
            <label for="price">Price *</label>
            <input
              type="number"
              id="price"
              formControlName="price"
              class="form-control"
              step="0.01"
            />
            <div
              class="error"
              *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched"
            >
              Valid price is required
            </div>
          </div>

          <div class="form-group">
            <label for="quantity">Quantity *</label>
            <input type="number" id="quantity" formControlName="quantity" class="form-control" />
            <div
              class="error"
              *ngIf="productForm.get('quantity')?.invalid && productForm.get('quantity')?.touched"
            >
              Valid quantity is required
            </div>
          </div>

          <div class="form-group">
            <label for="category_id">Category</label>
            <select id="category_id" formControlName="category_id" class="form-control">
              <option value="">Select Category</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="brand_id">Brand</label>
            <select id="brand_id" formControlName="brand_id" class="form-control">
              <option value="">Select Brand</option>
              <option *ngFor="let brand of brands" [value]="brand.id">{{ brand.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="gender_id">Gender</label>
            <select id="gender_id" formControlName="gender_id" class="form-control">
              <option value="">Select Gender</option>
              <option *ngFor="let gender of genders" [value]="gender.id">{{ gender.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="color_id">Color</label>
            <select id="color_id" formControlName="color_id" class="form-control">
              <option value="">Select Color</option>
              <option *ngFor="let color of colors" [value]="color.id">{{ color.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="size_id">Size</label>
            <select id="size_id" formControlName="size_id" class="form-control">
              <option value="">Select Size</option>
              <option *ngFor="let size of sizes" [value]="size.id">{{ size.name }}</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              class="form-control"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="image_url">Image URL</label>
            <input type="text" id="image_url" formControlName="image_url" class="form-control" />
          </div>

          <div class="form-group" *ngIf="isEditMode">
            <label>
              <input type="checkbox" formControlName="is_active" />
              Active
            </label>
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="productForm.invalid || isLoading"
          >
            {{ isLoading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product' }}
          </button>
          <a routerLink="/products" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .product-form-container {
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

      .form-group.full-width {
        grid-column: 1 / -1;
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

      .form-control:focus {
        outline: none;
        border-color: #3498db;
      }

      .error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
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
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private refDataService = inject(ReferenceDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  productId: number | null = null;

  categories: Category[] = [];
  brands: Brand[] = [];
  genders: Gender[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category_id: [''],
      brand_id: [''],
      gender_id: [''],
      color_id: [''],
      size_id: [''],
      image_url: [''],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadReferenceData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProduct(this.productId);
    }
  }

  loadReferenceData(): void {
    this.refDataService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) this.categories = response.data || [];
      },
    });

    this.refDataService.getAllBrands().subscribe({
      next: (response) => {
        if (response.success) this.brands = response.data || [];
      },
    });

    this.refDataService.getAllGenders().subscribe({
      next: (response) => {
        if (response.success) this.genders = response.data || [];
      },
    });

    this.refDataService.getAllColors().subscribe({
      next: (response) => {
        if (response.success) this.colors = response.data || [];
      },
    });

    this.refDataService.getAllSizes().subscribe({
      next: (response) => {
        if (response.success) this.sizes = response.data || [];
      },
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productForm.patchValue(response.data);
        }
      },
      error: (error) => console.error('Error loading product:', error),
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const productData = this.productForm.value;

      Object.keys(productData).forEach((key) => {
        if (productData[key] === '') {
          productData[key] = null;
        }
      });

      const request =
        this.isEditMode && this.productId
          ? this.productService.updateProduct(this.productId, productData)
          : this.productService.createProduct(productData);

      request.subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred';
        },
      });
    }
  }
}
