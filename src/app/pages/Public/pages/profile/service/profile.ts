// src/app/pages/Public/pages/profile/services/profile.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ProfileResponse, StandardResponse } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users`; 

  getProfile(username: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/profile/${encodeURIComponent(username)}`);
  }

  updateMyProfile(data: any, file?: File): Observable<StandardResponse<any>> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'socialLinks' && Array.isArray(data[key])) {
        // Serialization for complex objects in FormData
        for (let i = 0; i < data[key].length; i++) {
          formData.append(`socialLinks[${i}].platform`, data[key][i].platform);
          formData.append(`socialLinks[${i}].url`, data[key][i].url);
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (file) {
      formData.append('avatar', file);
    }
    
    return this.http.put<StandardResponse<any>>(`${this.baseUrl}/me/update-profile`, formData);
  }

  toggle2FA(enable: boolean): Observable<StandardResponse<any>> {
    return this.http.post<StandardResponse<any>>(`${this.baseUrl}/me/toggle-2fa`, { enable });
  }
}