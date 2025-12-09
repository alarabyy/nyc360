// src/app/pages/Public/pages/profile/services/profile.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProfileResponse, Toggle2FAResponse } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users`; 

  getProfile(username: string): Observable<ProfileResponse> {
    const encodedUsername = encodeURIComponent(username);
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile/${encodedUsername}`);
  }

  updateMyProfile(data: any, file?: File): Observable<ProfileResponse> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    if (file) {
      formData.append('avatar', file);
    }
    return this.http.put<ProfileResponse>(`${this.baseUrl}/me/update-profile`, formData);
  }

  /**
   * Toggle 2FA
   * Now accepts a boolean to explicitly enable or disable it.
   */
  toggle2FA(enable: boolean): Observable<Toggle2FAResponse> {
    // The body must match what Swagger expects: { "enable": true }
    return this.http.post<Toggle2FAResponse>(`${this.baseUrl}/me/toggle-2fa`, { enable });
  }
}