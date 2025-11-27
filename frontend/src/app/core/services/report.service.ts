import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  EarningsReport,
  TopSellingProduct,
  SalesByCategory,
  LowStockProduct,
  RevenueSummary,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getDailyEarnings(date?: string): Observable<ApiResponse<EarningsReport>> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<ApiResponse<EarningsReport>>(`${this.apiUrl}/earnings/daily`, { params });
  }

  getMonthlyEarnings(month?: number, year?: number): Observable<ApiResponse<EarningsReport>> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<EarningsReport>>(`${this.apiUrl}/earnings/monthly`, {
      params,
    });
  }

  getEarningsByDateRange(start_date: string, end_date: string): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('start_date', start_date).set('end_date', end_date);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/earnings/range`, { params });
  }

  getTopSellingProducts(limit: number = 10): Observable<ApiResponse<TopSellingProduct[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<TopSellingProduct[]>>(`${this.apiUrl}/products/top-selling`, {
      params,
    });
  }

  getSalesByCategory(): Observable<ApiResponse<SalesByCategory[]>> {
    return this.http.get<ApiResponse<SalesByCategory[]>>(`${this.apiUrl}/sales/category`);
  }

  getSalesByBrand(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/sales/brand`);
  }

  getLowStockProducts(threshold: number = 10): Observable<ApiResponse<LowStockProduct[]>> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<ApiResponse<LowStockProduct[]>>(`${this.apiUrl}/products/low-stock`, {
      params,
    });
  }

  getRevenueSummary(): Observable<ApiResponse<RevenueSummary>> {
    return this.http.get<ApiResponse<RevenueSummary>>(`${this.apiUrl}/revenue/summary`);
  }
}
