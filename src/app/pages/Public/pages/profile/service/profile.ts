// src/app/pages/Public/pages/profile/services/profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ApiResponse, UserProfileData, UpdateBasicProfileDto,
  AddEducationDto, UpdateEducationDto, AddPositionDto, UpdatePositionDto,
  SocialLinkDto, Toggle2FADto
} from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users`;

  // 1. GET Full Profile
  getProfile(username: string): Observable<ApiResponse<UserProfileData>> {
    return this.http.get<ApiResponse<UserProfileData>>(`${this.baseUrl}/profile/${encodeURIComponent(username)}`);
  }

  // 2. Images (Multipart)
  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('Avatar', file);
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/profile/avatar`, formData);
  }

  uploadCover(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('Cover', file);
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/profile/cover`, formData);
  }

  // 3. Basic Info (PATCH)
  updateBasicInfo(data: UpdateBasicProfileDto): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/profile/basic`, data);
  }

  // 4. Education
  addEducation(data: AddEducationDto): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/profile/educations`, data);
  }

  updateEducation(data: UpdateEducationDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/profile/educations`, data);
  }

  deleteEducation(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/profile/educations/${id}`);
  }

  // 5. Positions
  addPosition(data: AddPositionDto): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/profile/positions`, data);
  }

  updatePosition(data: UpdatePositionDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/profile/positions`, data);
  }

  deletePosition(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/profile/positions/${id}`);
  }

  // 6. Social Links
  addSocialLink(data: SocialLinkDto): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/profile/social-links`, data);
  }

  updateSocialLink(data: SocialLinkDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/profile/social-links`, data);
  }

  // 7. Security (2FA)
  toggle2FA(enable: boolean): Observable<ApiResponse<void>> {
    const body: Toggle2FADto = { Enable: enable };
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/me/toggle-2fa`, body);
  }
}