import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="layout">
      <nav class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="sidebar-header">
          <h2 *ngIf="!isSidebarCollapsed">Web Store</h2>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <span *ngIf="!isSidebarCollapsed">←</span>
            <span *ngIf="isSidebarCollapsed">→</span>
          </button>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="icon">📊</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/products" routerLinkActive="active">
              <span class="icon">📦</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Products</span>
            </a>
          </li>
          <li *ngIf="authService.hasRole(['admin', 'advanced_user'])">
            <a routerLink="/orders" routerLinkActive="active">
              <span class="icon">🛒</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Orders</span>
            </a>
          </li>
          <li *ngIf="authService.hasRole(['admin', 'advanced_user'])">
            <a routerLink="/clients" routerLinkActive="active">
              <span class="icon">👥</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Clients</span>
            </a>
          </li>
          <li *ngIf="authService.isAdmin">
            <a routerLink="/discounts" routerLinkActive="active">
              <span class="icon">💰</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Discounts</span>
            </a>
          </li>
          <li *ngIf="authService.hasRole(['admin', 'advanced_user'])">
            <a routerLink="/reports" routerLinkActive="active">
              <span class="icon">📈</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Reports</span>
            </a>
          </li>
          <li *ngIf="authService.isAdmin">
            <a routerLink="/users" routerLinkActive="active">
              <span class="icon">👤</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Users</span>
            </a>
          </li>
          <li *ngIf="authService.isAdmin">
            <a routerLink="/reference-data" routerLinkActive="active">
              <span class="icon">⚙️</span>
              <span class="text" *ngIf="!isSidebarCollapsed">Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="main-content">
        <header class="top-nav">
          <div class="user-info">
            <span class="username">{{ currentUser?.username }}</span>
            <span class="role">{{ currentUser?.role }}</span>
            <button class="btn-logout" (click)="logout()">Logout</button>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }

      .sidebar {
        width: 250px;
        background: #2c3e50;
        color: white;
        transition: width 0.3s;
        overflow-y: auto;
      }

      .sidebar.collapsed {
        width: 70px;
      }

      .sidebar-header {
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sidebar-header h2 {
        margin: 0;
        font-size: 20px;
      }

      .toggle-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
      }

      .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-menu li a {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.3s;
      }

      .nav-menu li a:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .nav-menu li a.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border-left: 4px solid #3498db;
      }

      .nav-menu .icon {
        font-size: 20px;
        margin-right: 15px;
        min-width: 30px;
        text-align: center;
      }

      .collapsed .text {
        display: none;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .top-nav {
        background: white;
        padding: 15px 30px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .username {
        font-weight: 600;
        color: #333;
      }

      .role {
        background: #3498db;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        text-transform: uppercase;
      }

      .btn-logout {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
      }

      .btn-logout:hover {
        background: #c0392b;
      }

      .content {
        flex: 1;
        overflow-y: auto;
        background: #f5f6fa;
        padding: 30px;
      }
    `,
  ],
})
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isSidebarCollapsed = false;
  currentUser = this.authService.currentUserValue;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}