import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(this.tokenService.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  get isAdmin(): boolean {
  return this.currentUserValue?.role?.toLowerCase() === 'admin';
}

get isAdvancedUser(): boolean {
  return this.currentUserValue?.role?.toLowerCase() === 'advanced_user';
}

get isSimpleUser(): boolean {
  return this.currentUserValue?.role?.toLowerCase() === 'simple_user';
}

hasRole(roles: string[]): boolean {
  const userRole = this.currentUserValue?.role?.toLowerCase();
  return userRole ? roles.map(r => r.toLowerCase()).includes(userRole) : false;
}

  login(email: string, password: string): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http
      .post<ApiResponse<{ user: User; token: string }>>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.tokenService.setToken(response.data.token);
            this.tokenService.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  register(
    username: string,
    email: string,
    password: string,
    role?: string
  ): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http
      .post<ApiResponse<{ user: User; token: string }>>(`${environment.apiUrl}/auth/register`, {
        username,
        email,
        password,
        role,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.tokenService.setToken(response.data.token);
            this.tokenService.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  logout(): void {
    this.tokenService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
