// src/app/pages/Public/pages/community/services/community.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, CommunityHomeData } from '../models/community';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private http = inject(HttpClient);
  
  // Endpoint الأساسي
  private baseUrl = `${environment.apiBaseUrl}/communities`;

  // 1. GET: /api/communities/home
  getCommunityHome(page: number = 1, pageSize: number = 20): Observable<ApiResponse<CommunityHomeData>> {
    const params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);

    return this.http.get<ApiResponse<CommunityHomeData>>(`${this.baseUrl}/home`, { params });
  }

  // 2. POST: /api/communities/join
  joinCommunity(communityId: number): Observable<ApiResponse<any>> {
    // إرسال الـ ID في الـ Query String أو Body حسب الباك اند
    // هنا نفترض أنه Query Parameter كما في الـ Swagger الشائع، أو Body إذا لزم الأمر
    // بناءً على الـ Curl الذي أرسلته سابقاً، الـ POST كان بدون Body، لكن سأضع الاحتياط
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/join?communityId=${communityId}`, {});
  }
}