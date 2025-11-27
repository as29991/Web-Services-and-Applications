export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
}

export interface Color {
  id: number;
  name: string;
  hex_code?: string;
}

export interface Size {
  id: number;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface Gender {
  id: number;
  name: string;
  description?: string;
}
