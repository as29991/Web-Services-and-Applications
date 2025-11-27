export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'advanced_user' | 'simple_user';
  is_active: boolean;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}
