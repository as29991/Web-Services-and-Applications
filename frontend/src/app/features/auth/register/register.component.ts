import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Web Store</h1>
        <h2>Register</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              [class.invalid]="
                registerForm.get('username')?.invalid && registerForm.get('username')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
            >
              <span *ngIf="registerForm.get('username')?.errors?.['required']"
                >Username is required</span
              >
              <span *ngIf="registerForm.get('username')?.errors?.['minlength']"
                >Username must be at least 3 characters</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.invalid]="
                registerForm.get('email')?.invalid && registerForm.get('email')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Invalid email format</span>
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
                registerForm.get('password')?.invalid && registerForm.get('password')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
              <span *ngIf="registerForm.get('password')?.errors?.['required']"
                >Password is required</span
              >
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']"
                >Password must be at least 6 characters</span
              >
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-control"
              [class.invalid]="
                registerForm.get('confirmPassword')?.invalid &&
                registerForm.get('confirmPassword')?.touched
              "
            />
            <div
              class="error-message"
              *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
            >
              <span>Passwords do not match</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Register</span>
            <span *ngIf="isLoading">Loading...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, email, password } = this.registerForm.value;

      this.authService.register(username, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        },
      });
    }
  }
}
