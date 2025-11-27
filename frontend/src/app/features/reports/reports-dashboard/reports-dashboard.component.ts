import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <h1>Reports & Analytics</h1>

      <div class="report-section">
        <h2>Revenue Summary</h2>
        <div class="stats-grid" *ngIf="revenueSummary">
          <div class="stat-card">
            <h3>Today</h3>
            <p class="value">\${{ revenueSummary.today.revenue.toFixed(2) }}</p>
            <p class="label">{{ revenueSummary.today.orders }} orders</p>
          </div>
          <div class="stat-card">
            <h3>This Month</h3>
            <p class="value">\${{ revenueSummary.this_month.revenue.toFixed(2) }}</p>
            <p class="label">{{ revenueSummary.this_month.orders }} orders</p>
          </div>
          <div class="stat-card">
            <h3>This Year</h3>
            <p class="value">\${{ revenueSummary.this_year.revenue.toFixed(2) }}</p>
            <p class="label">{{ revenueSummary.this_year.orders }} orders</p>
          </div>
          <div class="stat-card">
            <h3>All Time</h3>
            <p class="value">\${{ revenueSummary.all_time.revenue.toFixed(2) }}</p>
            <p class="label">{{ revenueSummary.all_time.orders }} orders</p>
          </div>
        </div>
      </div>

      <div class="report-section">
        <h2>Top Selling Products</h2>
        <div class="products-table" *ngIf="topProducts.length > 0">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of topProducts">
                <td>{{ product.product_name }}</td>
                <td>{{ product.category }}</td>
                <td>{{ product.brand }}</td>
                <td>{{ product.total_sold }}</td>
                <td>\${{ product.total_revenue.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="report-section">
        <h2>Sales by Category</h2>
        <div class="category-grid" *ngIf="salesByCategory.length > 0">
          <div class="category-card" *ngFor="let category of salesByCategory">
            <h3>{{ category.category_name }}</h3>
            <p class="value">\${{ category.total_revenue.toFixed(2) }}</p>
            <p class="label">{{ category.total_units_sold }} units sold</p>
          </div>
        </div>
      </div>

      <div class="report-section">
        <h2>Low Stock Products</h2>
        <div class="threshold-selector">
          <label>Stock Threshold:</label>
          <input type="number" [(ngModel)]="stockThreshold" (change)="loadLowStock()" min="1" />
        </div>
        <div class="products-table" *ngIf="lowStockProducts.length > 0">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of lowStockProducts">
                <td>{{ product.product_name }}</td>
                <td>{{ product.category }}</td>
                <td class="stock-warning">{{ product.current_quantity }}</td>
                <td>{{ product.sold_quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reports-container {
        max-width: 1400px;
      }

      h1 {
        font-size: 32px;
        color: #2c3e50;
        margin-bottom: 30px;
      }

      h2 {
        font-size: 24px;
        color: #2c3e50;
        margin-bottom: 20px;
      }

      .report-section {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }

      .stat-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }

      .stat-card h3 {
        margin: 0 0 10px 0;
        color: #7f8c8d;
        font-size: 14px;
      }

      .value {
        font-size: 28px;
        font-weight: 700;
        color: #27ae60;
        margin: 10px 0;
      }

      .label {
        color: #95a5a6;
        font-size: 13px;
      }

      .products-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .products-table th {
        background: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid #e0e0e0;
      }

      .products-table td {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .category-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }

      .category-card h3 {
        margin: 0 0 10px 0;
        color: #2c3e50;
      }

      .threshold-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }

      .threshold-selector input {
        padding: 8px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        width: 100px;
      }

      .stock-warning {
        color: #e74c3c;
        font-weight: 700;
      }
    `,
  ],
})
export class ReportsDashboardComponent implements OnInit {
  private reportService = inject(ReportService);

  revenueSummary: any = null;
  topProducts: any[] = [];
  salesByCategory: any[] = [];
  lowStockProducts: any[] = [];
  stockThreshold = 10;

  ngOnInit(): void {
    this.loadRevenueSummary();
    this.loadTopProducts();
    this.loadSalesByCategory();
    this.loadLowStock();
  }

  loadRevenueSummary(): void {
    this.reportService.getRevenueSummary().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.revenueSummary = response.data;
        }
      },
    });
  }

  loadTopProducts(): void {
    this.reportService.getTopSellingProducts(10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.topProducts = response.data;
        }
      },
    });
  }

  loadSalesByCategory(): void {
    this.reportService.getSalesByCategory().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.salesByCategory = response.data;
        }
      },
    });
  }

  loadLowStock(): void {
    this.reportService.getLowStockProducts(this.stockThreshold).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lowStockProducts = response.data;
        }
      },
    });
  }
}
