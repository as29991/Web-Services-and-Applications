import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Product, ProductQuantity, ProductSearchParams } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  getAllProducts(
    page: number = 1,
    limit: number = 10,
    is_active?: boolean
  ): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (is_active !== undefined) {
      params = params.set('is_active', is_active.toString());
    }

    return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { params });
  }

  searchProducts(searchParams: ProductSearchParams): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();

    Object.keys(searchParams).forEach((key) => {
      const value = (searchParams as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/search`, { params });
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  getProductQuantity(id: number): Observable<ApiResponse<ProductQuantity>> {
    return this.http.get<ApiResponse<ProductQuantity>>(`${this.apiUrl}/${id}/quantity`);
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product);
  }

  updateProductStock(id: number, quantity: number): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(`${this.apiUrl}/${id}/stock`, { quantity });
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
