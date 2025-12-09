import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../pages/Authentication/Service/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // ---------------------------------------------------------
  // 1. Check Login using Token in localStorage (FIXED)
  // ---------------------------------------------------------
  const token = localStorage.getItem('nyc360_token');

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  // ---------------------------------------------------------
  // 2. Check Permissions (If route requires specific permission)
  // ---------------------------------------------------------
  const requiredPermission = route.data['permission'] as string;

  if (requiredPermission) {
    if (!authService.hasPermission(requiredPermission)) {
      alert('Access Denied: You do not have the required permission.');
      return false;
    }
  }

  return true;
};
