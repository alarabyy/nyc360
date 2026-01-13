import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; 
import { jwtDecode } from 'jwt-decode'; 

// Models
import { 
  AuthResponse, ChangePasswordRequest, ConfirmEmailRequest, ForgotPasswordRequest, 
  RefreshTokenRequest, ResetPasswordRequest, LoginResponseData
} from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 
  
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  
  private tokenKey = 'nyc360_token'; 
  private refreshTokenKey = 'nyc360_refresh_token'; 

  // User State
  public currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    // محاولة تحميل المستخدم عند بدء التطبيق
    this.loadUserFromToken();
  }

  // ============================================================
  // 1. HELPER METHODS (GETTERS) ✅ (New & Critical)
  // ============================================================

  /**
   * ✅ دالة جاهزة لجلب الـ ID الخاص بالمستخدم الحالي كرقم
   * استخدمها في أي Component عشان تعرف مين اللي فاتح
   */
  getUserId(): number | null {
    const user = this.currentUser$.value;
    if (user && user.id) {
      return Number(user.id);
    }
    return null;
  }

  getUserName(): string {
    return this.currentUser$.value?.username || 'Guest';
  }

  getAvatar(): string | null {
    return this.currentUser$.value?.imageUrl || null;
  }

  isLoggedIn(): boolean {
    // التحقق من وجود قيمة في الـ BehaviorSubject
    return !!this.currentUser$.value;
  }

  // ============================================================
  // 2. PERMISSION & ROLE CHECKS
  // ============================================================

  hasPermission(permission: string): boolean {
    const user = this.currentUser$.value;
    if (!user) return false;
    if (this.hasRole('SuperAdmin')) return true;
    const userPermissions: string[] = user.permissions || [];
    return userPermissions.includes(permission);
  }

  hasRole(targetRole: string): boolean {
    const user = this.currentUser$.value;
    if (!user || !user.role) return false;
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    if (userRoles.includes('SuperAdmin')) return true;
    return userRoles.includes(targetRole);
  }

  // ============================================================
  // 3. API CALLS (ACCOUNT MANAGEMENT Only)
  // ============================================================

  refreshToken(data: RefreshTokenRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/refresh-token`, data);
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/password-reset`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, data);
  }

  // ============================================================
  // 4. STATE MANAGEMENT & HELPERS
  // ============================================================

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.currentUser$.next(null);
    this.router.navigate(['/auth/login']); 
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(this.tokenKey);
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(this.refreshTokenKey);
    return null;
  }

  public saveTokens(accessToken: string, refreshToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) localStorage.setItem(this.refreshTokenKey, refreshToken);
      
      // تحديث حالة المستخدم فوراً بعد الحفظ
      this.loadUserFromToken();
    }
  }

  /**
   * 🔥 Load User + Check Expiration
   * تقوم بفك التوكن واستخراج البيانات وتخزينها في currentUser$
   */
  public loadUserFromToken() {
    // 1. لو مش براوزر، اخرج (SSR Safety)
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // 2. فحص صلاحية التوكن (Expiration Check)
        if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
          console.warn('⚠️ Token expired. Logging out.');
          this.logout(); 
          return;
        }

        // 3. استخراج البيانات (Mapping Claims)
        // بنحاول نجيب الـ ID من كل الأسماء المحتملة في .NET Identity
        const user = {
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
              || decoded['nameid'] 
              || decoded['sub'] 
              || decoded['id'] 
              || decoded['userId'],
          
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
                 || decoded['email'],
          
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
                || decoded['role'],
          
          username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
                    || decoded['unique_name'] 
                    || decoded['sub'] 
                    || '',
          
          // لو الصورة بتيجي في التوكن
          imageUrl: decoded['ImageUrl'] || decoded['image'] || null, 

          permissions: decoded.permissions || decoded.Permissions || []
        };
        
        // تحديث الحالة فوراً
        this.currentUser$.next(user);
        // console.log('User Loaded from Token:', user); // (اختياري للتبع)

      } catch (e) {
        console.error('Invalid Token:', e);
        this.logout();
      }
    } else {
      this.currentUser$.next(null);
    }
  }
}