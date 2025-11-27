import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="client-form-container">
      <h1>{{ isEditMode ? 'Edit Client' : 'Add Client' }}</h1>

      <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <div class="form-group">
            <label for="first_name">First Name *</label>
            <input type="text" id="first_name" formControlName="first_name" class="form-control" />
          </div>

          <div class="form-group">
            <label for="last_name">Last Name *</label>
            <input type="text" id="last_name" formControlName="last_name" class="form-control" />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" formControlName="email" class="form-control" />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="text" id="phone" formControlName="phone" class="form-control" />
          </div>

          <div class="form-group full-width">
            <label for="address">Address</label>
            <input type="text" id="address" formControlName="address" class="form-control" />
          </div>

          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" formControlName="city" class="form-control" />
          </div>

          <div class="form-group">
            <label for="postal_code">Postal Code</label>
            <input
              type="text"
              id="postal_code"
              formControlName="postal_code"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" formControlName="country" class="form-control" />
          </div>
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="clientForm.invalid || isLoading"
          >
            {{ isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create' }}
          </button>
          <a routerLink="/clients" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .client-form-container {
        max-width: 900px;
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

      .form-group.full-width {
        grid-column: 1 / -1;
      }

      .form-group {
        display: flex;
        flex-direction: column;
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
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  clientId: number | null = null;

  constructor() {
    this.clientForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      postal_code: [''],
      country: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clientId = Number(id);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.clientForm.patchValue(response.data);
        }
      },
      error: (error) => console.error('Error loading client:', error),
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const request =
        this.isEditMode && this.clientId
          ? this.clientService.updateClient(this.clientId, this.clientForm.value)
          : this.clientService.createClient(this.clientForm.value);

      request.subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/clients']);
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
