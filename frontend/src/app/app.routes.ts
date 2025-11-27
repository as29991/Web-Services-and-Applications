import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';
import { OrderFormComponent } from './features/orders/order-form/order-form.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';
import { DiscountListComponent } from './features/discounts/discount-list/discount-list.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { ReferenceDataListComponent } from './features/reference-data/reference-data-list/reference-data-list.component';
import { ReportsDashboardComponent } from './features/reports/reports-dashboard/reports-dashboard.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'products',
        component: ProductListComponent,
      },
      {
        path: 'products/create',
        component: ProductFormComponent,
      },
      {
        path: 'products/:id',
        component: ProductDetailComponent,
      },
      {
        path: 'products/:id/edit',
        component: ProductFormComponent,
      },
      {
        path: 'orders',
        component: OrderListComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'orders/create',
        component: OrderFormComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'orders/:id',
        component: OrderDetailComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'clients',
        component: ClientListComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'clients/create',
        component: ClientFormComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'clients/:id/edit',
        component: ClientFormComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'reports',
        component: ReportsDashboardComponent,
        canActivate: [roleGuard(['admin', 'advanced_user'])],
      },
      {
        path: 'discounts',
        component: DiscountListComponent,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'reference-data',
        component: ReferenceDataListComponent,
        canActivate: [roleGuard(['admin'])],
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];