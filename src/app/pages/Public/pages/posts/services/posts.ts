import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ApiResponse, Post, FeedData, InteractionType, PostComment, TagPostsResponse 
} from '../models/posts';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  
  // الروابط الأساسية
  private baseUrl = `${environment.apiBaseUrl}/posts`;
  private feedUrl = `${environment.apiBaseUrl}/feeds/all/home`;

  // =================================================================
  // 1. NEW METHODS: For Home Page & Tags (Public View)
  // =================================================================
  
  // Home News Feed
  getPostsFeed(): Observable<ApiResponse<FeedData>> {
    return this.http.get<ApiResponse<FeedData>>(this.feedUrl);
  }

  // Tag Posts Page
  getPostsByTag(tag: string, page: number = 1, pageSize: number = 20): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);
      
    // Encode tag to handle spaces and special characters safely
    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/tags/${encodeURIComponent(tag)}`, { params });
  }

  // =================================================================
  // 2. EXISTING METHODS: For Admin Panel & CRUD
  // =================================================================

  // --- Read List (Updated for Search & Category Filtering) ---
  getAllPosts(category?: number, search?: string, page: number = 1, pageSize: number = 10): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    // إضافة الفلتر بالقسم فقط إذا لم يكن "All" (الذي نرمز له بـ -1 أو null)
    if (category !== undefined && category !== null && category !== -1) {
      params = params.set('category', category.toString());
    }

    // إضافة البحث إذا وجد
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/list`, { params });
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.baseUrl}/${id}`);
  }

  createPost(data: any, files?: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.category !== null) {
        formData.append('category', data.category.toString());
    }
    
    if (files && files.length > 0) {
      files.forEach(file => formData.append('attachments', file));
    }
    
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/create`, formData);
  }

  updatePost(id: number, data: any, files?: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('postId', id.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.category !== null) {
        formData.append('category', data.category.toString());
    }
    
    if (files && files.length > 0) {
      files.forEach(file => formData.append('addedAttachments', file));
    }
    
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/edit`, formData);
  }

  deletePost(id: number): Observable<ApiResponse<any>> {
    return this.http.request<ApiResponse<any>>('delete', `${this.baseUrl}/delete`, { body: { postId: id } });
  }

  interact(postId: number, type: InteractionType): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${postId}/interact`, { type });
  }

  addComment(postId: number, content: string, parentCommentId?: number): Observable<ApiResponse<PostComment>> {
    const body = { 
      postId, 
      content, 
      parentCommentId: parentCommentId || 0 
    };
    return this.http.post<ApiResponse<PostComment>>(`${this.baseUrl}/comment`, body);
  }
}