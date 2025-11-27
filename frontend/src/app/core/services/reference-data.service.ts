import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, Brand, Color, Size, Gender } from '../models/reference-data.model';

@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reference`;

  getAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`);
  }

  createCategory(category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/categories/${id}`);
  }

  getAllBrands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.baseUrl}/brands`);
  }

  createBrand(brand: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>(`${this.baseUrl}/brands`, brand);
  }

  updateBrand(id: number, brand: Partial<Brand>): Observable<ApiResponse<Brand>> {
    return this.http.put<ApiResponse<Brand>>(`${this.baseUrl}/brands/${id}`, brand);
  }

  deleteBrand(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/brands/${id}`);
  }

  getAllColors(): Observable<ApiResponse<Color[]>> {
    return this.http.get<ApiResponse<Color[]>>(`${this.baseUrl}/colors`);
  }

  createColor(color: Partial<Color>): Observable<ApiResponse<Color>> {
    return this.http.post<ApiResponse<Color>>(`${this.baseUrl}/colors`, color);
  }

  updateColor(id: number, color: Partial<Color>): Observable<ApiResponse<Color>> {
    return this.http.put<ApiResponse<Color>>(`${this.baseUrl}/colors/${id}`, color);
  }

  deleteColor(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/colors/${id}`);
  }

  getAllSizes(): Observable<ApiResponse<Size[]>> {
    return this.http.get<ApiResponse<Size[]>>(`${this.baseUrl}/sizes`);
  }

  createSize(size: Partial<Size>): Observable<ApiResponse<Size>> {
    return this.http.post<ApiResponse<Size>>(`${this.baseUrl}/sizes`, size);
  }

  updateSize(id: number, size: Partial<Size>): Observable<ApiResponse<Size>> {
    return this.http.put<ApiResponse<Size>>(`${this.baseUrl}/sizes/${id}`, size);
  }

  deleteSize(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/sizes/${id}`);
  }

  getAllGenders(): Observable<ApiResponse<Gender[]>> {
    return this.http.get<ApiResponse<Gender[]>>(`${this.baseUrl}/genders`);
  }

  createGender(gender: Partial<Gender>): Observable<ApiResponse<Gender>> {
    return this.http.post<ApiResponse<Gender>>(`${this.baseUrl}/genders`, gender);
  }

  updateGender(id: number, gender: Partial<Gender>): Observable<ApiResponse<Gender>> {
    return this.http.put<ApiResponse<Gender>>(`${this.baseUrl}/genders/${id}`, gender);
  }

  deleteGender(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/genders/${id}`);
  }
}
