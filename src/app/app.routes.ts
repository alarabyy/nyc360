import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './pages/Layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './pages/Layout/admin-layout/admin-layout.component';
import { authGuard } from './guard/auth-guard'; // Ensure correct path to your Guard
import { AuthLayout } from './pages/Layout/auth-layout/auth-layout';

export const routes: Routes = [
  
  // ============================================================
  // 1. PUBLIC LAYOUT (Accessible to everyone)
  // ============================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // --- General Pages ---
      {
        path: '',
        loadComponent: () => import('./pages/Public/pages/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/Public/pages/about-us/about-us').then(m => m.AboutUsComponent)
      },
    
      // --- User Profile Pages ---
      {
        // View specific user profile (e.g., /profile/john_doe)
        path: 'profile/:username', 
        loadComponent: () => import('./pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent)
      },
      {
        // View own profile (fallback if username is missing)
        path: 'profile', 
        loadComponent: () => import('./pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent)
      },
    ]
  },

  // ============================================================
  // 2. ADMIN LAYOUT (Protected by AuthGuard)
  // ============================================================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // 🔒 Security Guard
    children: [
      
      // --- Dashboard ---
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/Dashboard/pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // --- User Management ---
      {
        path: 'User',
        loadComponent: () => import('./pages/Dashboard/pages/users/userlist/userlist').then(m => m.UserList)
      },
      
      // --- Role Management Routes ---
      {
        path: 'Role',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/roles-list/roles-list').then(m => m.RolesListComponent)
      },      
      { 
        path: 'roles/edit/:id',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/edit-role/edit-role').then(m => m.EditRoleComponent)
      },
      { 
        path: 'roles/create',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/role-form/role-form').then(m => m.RoleFormComponent)
      },

      // --- RSS Feed Management ---
      {
        path: 'rss',
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-list/rss-list').then(m => m.RssListComponent)
      },
      {
        path: 'rss/create',
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent)
      },
      {
        // We rely on history.state for data here
        path: 'rss/edit', 
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent)
      },
      { path: 'posts', loadComponent: () => import('./pages/Dashboard/pages/posts/post-list/post-list').then(m => m.PostListComponent) },
      { path: 'posts/create', loadComponent: () => import('./pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },
      { path: 'posts/edit/:id', loadComponent: () => import('./pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) },
      { path: 'posts/details/:id', loadComponent: () => import('./pages/Dashboard/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) },
    ]
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [

      // --- Authentication Pages ---
      {
        path: 'login',
        loadComponent: () => import('./pages/Authentication/pages/login/login').then(m => m.LoginComponent)
      },
      { 
        path: 'verify-otp', 
        loadComponent: () => import('./pages/Authentication/pages/verify-otp/verify-otp').then(m => m.VerifyOtpComponent) 
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/Authentication/pages/signup/signup').then(m => m.SignupComponent)
      },      
      {
        path: 'register-selection',
        loadComponent: () => import('./pages/Authentication/pages/register-selection/register-selection').then(m => m.RegisterSelectionComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/Authentication/pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'confirm-email', 
        loadComponent: () => import('./pages/Authentication/pages/confirm-email/confirm-email').then(m => m.ConfirmEmailComponent)
      },
      {
       path: 'reset-password', 
       loadComponent: () => import('./pages/Authentication/pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)
      },


    ]
  },
  // ============================================================
  // 3. WILDCARD ROUTE (404 Not Found)
  // ============================================================
  
  {
    path: '**',
    loadComponent: () => import('./pages/Public/Widgets/not-found/not-found').then(m => m.NotFoundComponent)
  }

];