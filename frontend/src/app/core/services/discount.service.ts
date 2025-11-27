import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Discount } from '../models/discount.model';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/discounts`;

  getAllDiscounts(
    page: number = 1,
    limit: number = 10,
    is_active?: boolean
  ): Observable<ApiResponse<Discount[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (is_active !== undefined) {
      params = params.set('is_active', is_active.toString());
    }

    return this.http.get<ApiResponse<Discount[]>>(this.apiUrl, { params });
  }

  getDiscountById(id: number): Observable<ApiResponse<Discount>> {
    return this.http.get<ApiResponse<Discount>>(`${this.apiUrl}/${id}`);
  }

  getProductDiscounts(productId: number, is_active?: boolean): Observable<ApiResponse<Discount[]>> {
    let params = new HttpParams();

    if (is_active !== undefined) {
      params = params.set('is_active', is_active.toString());
    }

    return this.http.get<ApiResponse<Discount[]>>(`${this.apiUrl}/product/${productId}`, {
      params,
    });
  }

  applyDiscount(discount: Partial<Discount>): Observable<ApiResponse<Discount>> {
    return this.http.post<ApiResponse<Discount>>(this.apiUrl, discount);
  }

  updateDiscount(id: number, discount: Partial<Discount>): Observable<ApiResponse<Discount>> {
    return this.http.put<ApiResponse<Discount>>(`${this.apiUrl}/${id}`, discount);
  }

  deactivateDiscount(id: number): Observable<ApiResponse<Discount>> {
    return this.http.patch<ApiResponse<Discount>>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteDiscount(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
