import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './pages/Layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './pages/Layout/admin-layout/admin-layout.component';
import { authGuard } from './guard/auth-guard'; 
import { AuthLayout } from './pages/Layout/auth-layout/auth-layout';
import { LandingLayout } from './pages/Layout/landing-layout/landing-layout';

export const routes: Routes = [
  
  // ============================================================
  // 1. LANDING & GENERAL (Root)
  // ============================================================
  {
    path: '',
    component: LandingLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('../app/pages/landing/pages/landing-page/landing-page').then(m => m.LandingPage)
      },
      {
        path: 'about',
        loadComponent: () => import('../app/pages/landing/pages/about-us/about-us').then(m => m.AboutUsComponent)
      }
    ]
  },

  // ============================================================
  // 2. PUBLIC LAYOUT (Authenticated & Guest Users)
  // ============================================================
  {
    path: 'public',
    component: PublicLayoutComponent,
    canActivate: [authGuard], // <--- ضيف السطر ده هنا
    children: [
      // Feed & Home
      {
        path: 'home',
        loadComponent: () => import('./pages/Public/pages/posts/home/home').then(m => m.Home)
      },
      { 
        path: 'posts/details/:id', 
        loadComponent: () => import('../app/pages/Public/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) 
      },




      // Profile Pages
      {
        path: 'profile/:username', 
        loadComponent: () => import('./pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent)
      },

    ]
  },

  // ============================================================
  // 3. ADMIN / DASHBOARD LAYOUT (Protected by AuthGuard)
  // ============================================================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard], 
    children: [
      
      // --- Dashboard Overview ---
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/Dashboard/pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // --- User Management ---
      {
        path: 'User',
        loadComponent: () => import('./pages/Dashboard/pages/users/userlist/userlist').then(m => m.UserList)
      },

      // --- Role Management ---
      {
        path: 'Role',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/roles-list/roles-list').then(m => m.RolesListComponent)
      },
      { 
        path: 'roles/create',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/role-form/role-form').then(m => m.RoleFormComponent)
      },
      { 
        path: 'roles/edit/:id',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/edit-role/edit-role').then(m => m.EditRoleComponent)
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
        path: 'rss/edit', 
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent)
      },

      // --- Posts Management ---
      { 
        path: 'posts', 
        loadComponent: () => import('./pages/Dashboard/pages/posts/post-list/post-list').then(m => m.PostListComponent) 
      },
      { 
        path: 'posts/create', 
        loadComponent: () => import('./pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) 
      },
      { 
        path: 'posts/edit/:id', 
        loadComponent: () => import('./pages/Dashboard/pages/posts/post-form/post-form').then(m => m.PostFormComponent) 
      },
      { 
        path: 'posts/details/:id', 
        loadComponent: () => import('../app/pages/Public/pages/posts/post-details/post-details').then(m => m.PostDetailsComponent) 
      },

      // --- Trending & Flags ---
      { 
        path: 'trending', 
        loadComponent: () => import('./pages/Dashboard/pages/posts/trending/trending').then(m => m.TrendingComponent) 
      },
      {
        path: 'flags',
        loadComponent: () => import('./pages/Dashboard/pages/posts/flags-list/flags-list').then(m => m.FlagsListComponent)
      }
    ]
  },

  // ============================================================
  // 4. AUTH LAYOUT (Login, Register, Recovery)
  // ============================================================
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/Authentication/pages/login/login').then(m => m.LoginComponent)
      },
      { 
        path: 'register-selection',
        loadComponent: () => import('./pages/Authentication/pages/register-selection/register-selection').then(m => m.RegisterSelectionComponent)
      },
      { 
        path: 'verify-otp', 
        loadComponent: () => import('./pages/Authentication/pages/verify-otp/verify-otp').then(m => m.VerifyOtpComponent) 
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
      }
    ]
  },

  // ============================================================
  // 5. WILDCARD (404 Not Found)
  // ============================================================
  {
    path: '**',
    loadComponent: () => import('./pages/Public/Widgets/not-found/not-found').then(m => m.NotFoundComponent)
  }
];