import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { AuthService } from '../../core/services/auth.service';
import { RevenueSummary } from '../../core/models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div class="stats-grid" *ngIf="revenueSummary">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>Today's Revenue</h3>
            <p class="stat-value">\${{ revenueSummary.today.revenue.toFixed(2) }}</p>
            <p class="stat-label">{{ revenueSummary.today.orders }} orders</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>This Month</h3>
            <p class="stat-value">\${{ revenueSummary.this_month.revenue.toFixed(2) }}</p>
            <p class="stat-label">{{ revenueSummary.this_month.orders }} orders</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>This Year</h3>
            <p class="stat-value">\${{ revenueSummary.this_year.revenue.toFixed(2) }}</p>
            <p class="stat-label">{{ revenueSummary.this_year.orders }} orders</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💎</div>
          <div class="stat-content">
            <h3>All Time</h3>
            <p class="stat-value">\${{ revenueSummary.all_time.revenue.toFixed(2) }}</p>
            <p class="stat-label">{{ revenueSummary.all_time.orders }} orders</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <a routerLink="/products/create" class="action-btn">
            <span class="icon">➕</span>
            <span>Add Product</span>
          </a>
          <a
            routerLink="/orders/create"
            class="action-btn"
            *ngIf="authService.hasRole(['admin', 'advanced_user'])"
          >
            <span class="icon">🛒</span>
            <span>Create Order</span>
          </a>
          <a routerLink="/clients/create" class="action-btn">
            <span class="icon">👤</span>
            <span>Add Client</span>
          </a>
          <a
            routerLink="/reports"
            class="action-btn"
            *ngIf="authService.hasRole(['admin', 'advanced_user'])"
          >
            <span class="icon">📊</span>
            <span>View Reports</span>
          </a>
        </div>
      </div>

      <div class="order-status" *ngIf="revenueSummary">
        <h2>Order Status Overview</h2>
        <div class="status-list">
          <div class="status-item" *ngFor="let status of revenueSummary.order_status_breakdown">
            <span class="status-name">{{ status.status }}</span>
            <span class="status-count">{{ status.count }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
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
        margin-top: 40px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }

      .stat-card {
        background: white;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .stat-icon {
        font-size: 48px;
      }

      .stat-content h3 {
        margin: 0 0 10px 0;
        color: #7f8c8d;
        font-size: 14px;
        font-weight: 500;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 5px 0;
      }

      .stat-label {
        color: #95a5a6;
        font-size: 13px;
        margin: 0;
      }

      .quick-actions {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px;
        background: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s;
      }

      .action-btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
      }

      .action-btn .icon {
        font-size: 24px;
      }

      .order-status {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-top: 30px;
      }

      .status-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .status-name {
        text-transform: capitalize;
        color: #555;
        font-weight: 500;
      }

      .status-count {
        background: #3498db;
        color: white;
        padding: 5px 12px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  authService = inject(AuthService);

  revenueSummary: RevenueSummary | null = null;

  ngOnInit(): void {
    this.loadRevenueSummary();
  }

  loadRevenueSummary(): void {
    if (this.authService.hasRole(['admin', 'advanced_user'])) {
      this.reportService.getRevenueSummary().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.revenueSummary = response.data;
          }
        },
        error: (error) => console.error('Error loading revenue summary:', error),
      });
    }
  }
}
