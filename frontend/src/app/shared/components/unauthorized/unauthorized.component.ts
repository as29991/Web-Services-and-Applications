import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-container">
      <div class="content">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <a routerLink="/dashboard" class="btn btn-primary">Go to Dashboard</a>
      </div>
    </div>
  `,
  styles: [
    `
      .unauthorized-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .content {
        text-align: center;
        color: white;
      }

      h1 {
        font-size: 120px;
        margin: 0;
        font-weight: 700;
      }

      h2 {
        font-size: 36px;
        margin: 20px 0;
      }

      p {
        font-size: 18px;
        margin-bottom: 30px;
      }

      .btn {
        padding: 12px 30px;
        background: white;
        color: #667eea;
        text-decoration: none;
        border-radius: 5px;
        font-weight: 600;
        display: inline-block;
      }
    `,
  ],
})
export class UnauthorizedComponent {}
