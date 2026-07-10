import { Routes } from '@angular/router';

const baseTitle = 'Restock';

export const routes: Routes = [
  { path: 'sign-in', loadComponent: () => import('./Restock/iam/pages/sign-in/sign-in.component').then(m => m.SignInComponent), title: `${baseTitle} | Sign in` },
  { path: 'sign-up', loadComponent: () => import('./Restock/iam/pages/sign-up/sign-up.component').then(m => m.SignUpComponent), title: `${baseTitle} | Sign up` },
  {
    path: 'dashboard/restaurant',
    loadComponent: () => import('./public/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', title: `${baseTitle} | Summary`, loadComponent: () => import('./Restock/Analytics/pages/analytics-overview-restaurant/analytics-overview-restaurant.component').then(m => m.AnalyticsOverviewRestaurantComponent) },
      { path: 'inventory', title: `${baseTitle} | Inventory`, loadComponent: () => import('./Restock/resource/inventory/pages/restaurant-inventory/restaurant-inventory.component').then(m => m.RestaurantInventoryComponent) },
      { path: 'subscription', title: `${baseTitle} | Subscription`, loadComponent: () => import('./Restock/subscription/pages/subscription-overview/subscription-overview.component').then(m => m.SubscriptionOverviewComponent) },
      { path: 'sales', title: `${baseTitle} | Sales`, loadComponent: () => import('./Restock/monitoring/restaurant-sales/pages/sales/sales.component').then(m => m.SalesComponent) },
      { path: 'orders', title: `${baseTitle} | Orders`, loadComponent: () => import('./Restock/resource/orders-to-suppliers/pages/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'profile', title: `${baseTitle} | Profile`, loadComponent: () => import('./Restock/profiles/pages/profile-overview/profile-overview.component').then(m => m.ProfileOverviewComponent) },
      { path: 'recipes', title: `${baseTitle} | Recipes`, loadComponent: () => import('./Restock/planning/recipe/pages/restaurant-recipes-overview/restaurant-recipes-overview.component').then(m => m.RestaurantRecipesOverviewComponent) },
      { path: 'notifications', title: `${baseTitle} | Notifications`, loadComponent: () => import('./Restock/resource/inventory/pages/restaurant-notifications/restaurant-notifications.component').then(m => m.RestaurantNotificationsComponent) }
    ]
  },
  {
    path: 'dashboard/supplier',
    loadComponent: () => import('./public/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', title: `${baseTitle} | Summary`, loadComponent: () => import('./Restock/Analytics/pages/analytics-overview-supplier/analytics-overview-supplier.component').then(m => m.AnalyticsOverviewSupplierComponent) },
      { path: 'inventory', title: `${baseTitle} | Inventory`, loadComponent: () => import('./Restock/resource/inventory/pages/supplier-inventory/supplier-inventory.component').then(m => m.SupplierInventory) },
      { path: 'subscription', title: `${baseTitle} | Subscription`, loadComponent: () => import('./Restock/subscription/pages/subscription-overview/subscription-overview.component').then(m => m.SubscriptionOverviewComponent) },
      { path: 'notifications', title: `${baseTitle} | Notifications`, loadComponent: () => import('./Restock/monitoring/suppliers-orders/pages/supplier-alerts-overview/supplier-alerts-overview.component').then(m => m.SupplierAlertsOverviewComponent) },
      { path: 'orders', title: `${baseTitle} | Orders`, loadComponent: () => import('./Restock/monitoring/suppliers-orders/pages/suppliers-orders-overview/suppliers-orders-overview.component').then(m => m.SuppliersOrdersOverviewComponent) },
      { path: 'reviews', title: `${baseTitle} | Reviews`, loadComponent: () => import('./Restock/resource/orders-to-suppliers/pages/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'profile', title: `${baseTitle} | Profile`, loadComponent: () => import('./Restock/profiles/pages/profile-overview/profile-overview.component').then(m => m.ProfileOverviewComponent) }
    ]
  },
  { path: '**', loadComponent: () => import('./public/role-redirect/role-redirect.component').then(m => m.RoleRedirectComponent) }
];
