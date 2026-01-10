import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// تعريف الانترفيس حسب الداتا اللي راجعة من الباك
export interface LocationSearchResult {
  id: number;
  borough: string;
  code: string;
  neighborhoodNet: string;
  neighborhood: string;
  zipCode: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityPostService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // ✅ 1. Search Locations (زي ما طلبت بالظبط)
  // GET /api/locations/search?Query=...&Limit=...
  searchLocations(query: string, limit: number = 20): Observable<ApiResponse<LocationSearchResult[]>> {
    const params = new HttpParams()
      .set('Query', query)
      .set('Limit', limit);
    return this.http.get<ApiResponse<LocationSearchResult[]>>(`${this.baseUrl}/locations/search`, { params });
  }

  // ✅ 2. Create Post (مطابق للـ Swagger)
  // POST /api/communities/create-post
  createPost(data: {
    communityId: number;
    title: string;
    content: string;
    tags: string[];      // هنبعت اسم اللوكيشن هنا
    attachments: File[];
  }): Observable<ApiResponse<any>> {
    
    const formData = new FormData();
    
    // Required Fields based on Swagger
    formData.append('CommunityId', data.communityId.toString());
    
    // Title (String)
    if (data.title) formData.append('Title', data.title);
    
    // Content (String)
    if (data.content) formData.append('Content', data.content);

    // Tags (Array of Strings) - ده اللي هنحط فيه اللوكيشن
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        formData.append('Tags', tag); 
      });
    }

    // Attachments (Array of Files)
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => {
        formData.append('Attachments', file);
      });
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/communities/create-post`, formData);
  }
}