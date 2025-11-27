import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Web Store</h1>
        <h2>Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div
              class="error-message"
              *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
              <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.invalid]="
                loginForm.get('password')?.invalid && loginForm.get('password')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
              <span>Password is required</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Login</span>
            <span *ngIf="isLoading">Loading...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #16285aff 0%, #75b4dfff 100%);
        padding: 20px;
      }

      .auth-card {
        background: white;
        border-radius: 10px;
        padding: 40px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h1 {
        text-align: center;
        color: #000000ff;
        margin-bottom: 10px;
        font-size: 32px;
      }

      h2 {
        text-align: center;
        color: #000000ff;
        margin-bottom: 30px;
        font-size: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
      }

      .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 5px;
        font-size: 14px;
        transition: border-color 0.3s;
        box-sizing: border-box;
      }

      .form-control:focus {
        outline: none;
        border-color: #939bc1ff;
      }

      .form-control.invalid {
        border-color: #f44336;
      }

      .error-message {
        color: #f44336;
        font-size: 12px;
        margin-top: 5px;
      }

      .btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 10px;
      }

      .btn-primary {
        background: #5a6ec8ff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #6f80d2ff;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(87, 123, 214, 1);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .auth-footer {
        text-align: center;
        margin-top: 20px;
      }

      .auth-footer p {
        color: #666;
        font-size: 14px;
      }

      .auth-footer a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        },
      });
    }
  }
}
