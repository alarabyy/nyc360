import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, CommunityMember, CommunityProfileData } from '../models/community-profile';

@Injectable({
  providedIn: 'root'
})
export class CommunityProfileService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/communities`;

  // Get Profile & Posts
  getCommunityBySlug(slug: string, page: number = 1, pageSize: number = 20): Observable<ApiResponse<CommunityProfileData>> {
    const params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    return this.http.get<ApiResponse<CommunityProfileData>>(`${this.baseUrl}/${slug}`, { params });
  }

  // ✅ New: Get Members
  getCommunityMembers(communityId: number, page: number = 1, pageSize: number = 20): Observable<ApiResponse<CommunityMember[]>> {
    const params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    return this.http.get<ApiResponse<CommunityMember[]>>(`${this.baseUrl}/${communityId}/members`, { params });
  }
}