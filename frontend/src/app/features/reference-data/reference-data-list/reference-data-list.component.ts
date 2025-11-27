import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceDataService } from '../../../core/services/reference-data.service';
import { Category, Brand, Color, Size, Gender } from '../../../core/models/reference-data.model';

@Component({
  selector: 'app-reference-data-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reference-container">
      <h1>Reference Data Management</h1>

      <div class="tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'categories'"
          (click)="activeTab = 'categories'"
        >
          Categories
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'brands'"
          (click)="activeTab = 'brands'"
        >
          Brands
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'colors'"
          (click)="activeTab = 'colors'"
        >
          Colors
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'sizes'"
          (click)="activeTab = 'sizes'"
        >
          Sizes
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'genders'"
          (click)="activeTab = 'genders'"
        >
          Genders
        </button>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'categories'">
        <div class="section-header">
          <h2>Categories</h2>
          <button class="btn btn-primary" (click)="showCategoryForm = !showCategoryForm">
            {{ showCategoryForm ? 'Cancel' : '➕ Add Category' }}
          </button>
        </div>

        <div class="form-section" *ngIf="showCategoryForm">
          <input
            type="text"
            [(ngModel)]="newCategory.name"
            placeholder="Name *"
            class="form-control"
          />
          <input
            type="text"
            [(ngModel)]="newCategory.description"
            placeholder="Description"
            class="form-control"
          />
          <button class="btn btn-primary" (click)="createCategory()">Create</button>
        </div>

        <div class="items-grid">
          <div class="item-card" *ngFor="let category of categories">
            <div class="item-info">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description || 'No description' }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" (click)="deleteCategory(category.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'brands'">
        <div class="section-header">
          <h2>Brands</h2>
          <button class="btn btn-primary" (click)="showBrandForm = !showBrandForm">
            {{ showBrandForm ? 'Cancel' : '➕ Add Brand' }}
          </button>
        </div>

        <div class="form-section" *ngIf="showBrandForm">
          <input
            type="text"
            [(ngModel)]="newBrand.name"
            placeholder="Name *"
            class="form-control"
          />
          <input
            type="text"
            [(ngModel)]="newBrand.description"
            placeholder="Description"
            class="form-control"
          />
          <button class="btn btn-primary" (click)="createBrand()">Create</button>
        </div>

        <div class="items-grid">
          <div class="item-card" *ngFor="let brand of brands">
            <div class="item-info">
              <h3>{{ brand.name }}</h3>
              <p>{{ brand.description || 'No description' }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" (click)="deleteBrand(brand.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'colors'">
        <div class="section-header">
          <h2>Colors</h2>
          <button class="btn btn-primary" (click)="showColorForm = !showColorForm">
            {{ showColorForm ? 'Cancel' : '➕ Add Color' }}
          </button>
        </div>

        <div class="form-section" *ngIf="showColorForm">
          <input
            type="text"
            [(ngModel)]="newColor.name"
            placeholder="Name *"
            class="form-control"
          />
          <input type="color" [(ngModel)]="newColor.hex_code" class="form-control" />
          <button class="btn btn-primary" (click)="createColor()">Create</button>
        </div>

        <div class="items-grid">
          <div class="item-card" *ngFor="let color of colors">
            <div class="item-info">
              <div class="color-preview" [style.background-color]="color.hex_code"></div>
              <h3>{{ color.name }}</h3>
              <p>{{ color.hex_code }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" (click)="deleteColor(color.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'sizes'">
        <div class="section-header">
          <h2>Sizes</h2>
          <button class="btn btn-primary" (click)="showSizeForm = !showSizeForm">
            {{ showSizeForm ? 'Cancel' : '➕ Add Size' }}
          </button>
        </div>

        <div class="form-section" *ngIf="showSizeForm">
          <input type="text" [(ngModel)]="newSize.name" placeholder="Name *" class="form-control" />
          <input
            type="text"
            [(ngModel)]="newSize.description"
            placeholder="Description"
            class="form-control"
          />
          <input
            type="number"
            [(ngModel)]="newSize.sort_order"
            placeholder="Sort Order"
            class="form-control"
          />
          <button class="btn btn-primary" (click)="createSize()">Create</button>
        </div>

        <div class="items-grid">
          <div class="item-card" *ngFor="let size of sizes">
            <div class="item-info">
              <h3>{{ size.name }}</h3>
              <p>{{ size.description || 'No description' }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" (click)="deleteSize(size.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-content" *ngIf="activeTab === 'genders'">
        <div class="section-header">
          <h2>Genders</h2>
          <button class="btn btn-primary" (click)="showGenderForm = !showGenderForm">
            {{ showGenderForm ? 'Cancel' : '➕ Add Gender' }}
          </button>
        </div>

        <div class="form-section" *ngIf="showGenderForm">
          <input
            type="text"
            [(ngModel)]="newGender.name"
            placeholder="Name *"
            class="form-control"
          />
          <input
            type="text"
            [(ngModel)]="newGender.description"
            placeholder="Description"
            class="form-control"
          />
          <button class="btn btn-primary" (click)="createGender()">Create</button>
        </div>

        <div class="items-grid">
          <div class="item-card" *ngFor="let gender of genders">
            <div class="item-info">
              <h3>{{ gender.name }}</h3>
              <p>{{ gender.description || 'No description' }}</p>
            </div>
            <div class="item-actions">
              <button class="btn btn-sm btn-danger" (click)="deleteGender(gender.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reference-container {
        max-width: 1200px;
      }

      h1 {
        font-size: 32px;
        color: #2c3e50;
        margin-bottom: 30px;
      }

      .tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 30px;
        border-bottom: 2px solid #e0e0e0;
      }

      .tab-btn {
        padding: 12px 24px;
        border: none;
        background: none;
        cursor: pointer;
        font-weight: 600;
        color: #7f8c8d;
        transition: all 0.3s;
        border-bottom: 3px solid transparent;
      }

      .tab-btn.active {
        color: #3498db;
        border-bottom-color: #3498db;
      }

      .tab-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-header h2 {
        margin: 0;
        color: #2c3e50;
      }

      .form-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .form-control {
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
      }

      .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .item-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .item-info h3 {
        margin: 0 0 5px 0;
        color: #2c3e50;
      }

      .item-info p {
        margin: 0;
        color: #7f8c8d;
        font-size: 14px;
      }

      .color-preview {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-bottom: 10px;
        border: 2px solid #e0e0e0;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 13px;
      }

      .btn-danger {
        background: #e74c3c;
        color: white;
      }
    `,
  ],
})
export class ReferenceDataListComponent implements OnInit {
  private refDataService = inject(ReferenceDataService);

  activeTab = 'categories';

  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];
  genders: Gender[] = [];

  showCategoryForm = false;
  showBrandForm = false;
  showColorForm = false;
  showSizeForm = false;
  showGenderForm = false;

  newCategory: Partial<Category> = {};
  newBrand: Partial<Brand> = {};
  newColor: Partial<Color> = { hex_code: '#000000' };
  newSize: Partial<Size> = {};
  newGender: Partial<Gender> = {};

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadColors();
    this.loadSizes();
    this.loadGenders();
  }

  loadCategories(): void {
    this.refDataService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) this.categories = response.data || [];
      },
    });
  }

  loadBrands(): void {
    this.refDataService.getAllBrands().subscribe({
      next: (response) => {
        if (response.success) this.brands = response.data || [];
      },
    });
  }

  loadColors(): void {
    this.refDataService.getAllColors().subscribe({
      next: (response) => {
        if (response.success) this.colors = response.data || [];
      },
    });
  }

  loadSizes(): void {
    this.refDataService.getAllSizes().subscribe({
      next: (response) => {
        if (response.success) this.sizes = response.data || [];
      },
    });
  }

  loadGenders(): void {
    this.refDataService.getAllGenders().subscribe({
      next: (response) => {
        if (response.success) this.genders = response.data || [];
      },
    });
  }

  createCategory(): void {
    if (this.newCategory.name) {
      this.refDataService.createCategory(this.newCategory).subscribe({
        next: () => {
          this.newCategory = {};
          this.showCategoryForm = false;
          this.loadCategories();
        },
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Delete this category?')) {
      this.refDataService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
      });
    }
  }

  createBrand(): void {
    if (this.newBrand.name) {
      this.refDataService.createBrand(this.newBrand).subscribe({
        next: () => {
          this.newBrand = {};
          this.showBrandForm = false;
          this.loadBrands();
        },
      });
    }
  }

  deleteBrand(id: number): void {
    if (confirm('Delete this brand?')) {
      this.refDataService.deleteBrand(id).subscribe({
        next: () => this.loadBrands(),
      });
    }
  }

  createColor(): void {
    if (this.newColor.name) {
      this.refDataService.createColor(this.newColor).subscribe({
        next: () => {
          this.newColor = { hex_code: '#000000' };
          this.showColorForm = false;
          this.loadColors();
        },
      });
    }
  }

  deleteColor(id: number): void {
    if (confirm('Delete this color?')) {
      this.refDataService.deleteColor(id).subscribe({
        next: () => this.loadColors(),
      });
    }
  }

  createSize(): void {
    if (this.newSize.name) {
      this.refDataService.createSize(this.newSize).subscribe({
        next: () => {
          this.newSize = {};
          this.showSizeForm = false;
          this.loadSizes();
        },
      });
    }
  }

  deleteSize(id: number): void {
    if (confirm('Delete this size?')) {
      this.refDataService.deleteSize(id).subscribe({
        next: () => this.loadSizes(),
      });
    }
  }

  createGender(): void {
    if (this.newGender.name) {
      this.refDataService.createGender(this.newGender).subscribe({
        next: () => {
          this.newGender = {};
          this.showGenderForm = false;
          this.loadGenders();
        },
      });
    }
  }

  deleteGender(id: number): void {
    if (confirm('Delete this gender?')) {
      this.refDataService.deleteGender(id).subscribe({
        next: () => this.loadGenders(),
      });
    }
  }
}
