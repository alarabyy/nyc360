import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; 
import { jwtDecode } from 'jwt-decode'; 

// Models
import { 
  AuthResponse, ChangePasswordRequest, ConfirmEmailRequest, ForgotPasswordRequest, 
  GoogleLoginRequest, LoginRequest, LoginResponseData, 
  RefreshTokenRequest, RegisterNormalUserRequest, RegisterOrganizationRequest, RegisterRequest, ResetPasswordRequest
} from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // --- Dependencies ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 
  
  // --- Config ---
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private oauthUrl = `${environment.apiBaseUrl}/oauth`; 
  
  private tokenKey = 'nyc360_token'; 
  private refreshTokenKey = 'nyc360_refresh_token'; 

  // --- State (Holds User Info + Permissions) ---
  // This is the source of truth for the current user
  public currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    // Load user immediately on app start if token exists
    this.loadUserFromToken();
  }

  // ============================================================
  // 1. PERMISSION & ROLE CHECKS (CORE LOGIC)
  // ============================================================

  /**
   * Checks if the current user has a specific permission.
   * @param permission The permission string (e.g. 'Permissions.Users.View')
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser$.value;
    if (!user) return false;

    // 1. SuperAdmin bypass (Access to everything)
    if (this.hasRole('SuperAdmin')) return true;

    // 2. Check if permission exists in the user's list
    const userPermissions: string[] = user.permissions || [];
    return userPermissions.includes(permission);
  }

  /**
   * Checks if the user belongs to a specific Role.
   */
  hasRole(targetRole: string): boolean {
    const user = this.currentUser$.value;
    if (!user || !user.role) return false;

    if (Array.isArray(user.role)) {
      return user.role.includes(targetRole);
    }
    return user.role === targetRole;
  }

  /**
   * Checks if user is authenticated.
   */
  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }

  // ============================================================
  // 2. API CALLS (LOGIN & AUTH)
  // ============================================================

  // --- REGISTRATION ENDPOINTS ---

  // 1. Normal User (Visitor or New Yorker)
  registerNormalUser(data: RegisterNormalUserRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register/normal-user`, data);
  }

  // 2. Organization
  registerOrganization(data: RegisterOrganizationRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register/organization`, data);
  }

  // 3. Generic Register (if needed)
  register(data: RegisterRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register`, data);
  }

  // --- LOGIN ENDPOINTS ---

  login(data: LoginRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/login`, data)
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }

  loginWithGoogleBackend(idToken: string): Observable<AuthResponse<LoginResponseData>> {
    const payload: GoogleLoginRequest = { idToken: idToken };
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.oauthUrl}/google`, payload)
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }

  login2FA(email: string, code: string): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/2fa-verify`, { email, code })
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }

  refreshToken(data: RefreshTokenRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/refresh-token`, data)
      .pipe(tap(res => this.handleLoginSuccess(res)));
  }

  // --- ACCOUNT MANAGEMENT ---

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

  getGoogleAuthUrl(): string {
    return `${this.apiUrl}/google-login`; 
  }

  // ============================================================
  // 3. STATE MANAGEMENT & HELPERS
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

  // --- Private Helpers ---

  private handleLoginSuccess(res: AuthResponse<LoginResponseData>) {
    // If login is successful AND we have tokens (not waiting for 2FA), save them
    if (res.isSuccess && res.data && res.data.accessToken) {
      if (!res.data.twoFactorRequired) {
        this.saveTokens(res.data.accessToken, res.data.refreshToken);
        this.loadUserFromToken(); // Update state immediately
      }
    }
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * 🔥 CRITICAL UPDATE: Robust Token Decoding
   * This maps complex claim names (from ASP.NET Identity) to simple properties.
   */
  private loadUserFromToken() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Map claims to a clean User Object
        const user = {
          // 1. ID Mapping (Checks all possible locations)
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
              || decoded['nameid'] 
              || decoded['sub'] 
              || decoded['id']
              || decoded['userId'],

          // 2. Email Mapping
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
                 || decoded['email'],

          // 3. Role Mapping
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] 
                || decoded['role'],

          // 4. Username Mapping
          username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
                    || decoded['unique_name'] 
                    || decoded['sub'] 
                    || '',
          
          // 5. Permissions Mapping
          permissions: decoded.permissions || decoded.Permissions || []
        };

        // Debugging to ensure ID is captured correctly
        // console.log('AuthService: User Loaded', user); 

        this.currentUser$.next(user);
      } catch (e) {
        console.error('Invalid Token:', e);
        this.logout();
      }
    } else {
      this.currentUser$.next(null);
    }
  }
}