import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, Post, InteractionType, Comment } from '../models/posts';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  
  // تأكد أن الرابط الأساسي صحيح
  private baseUrl = `${environment.apiBaseUrl}/posts-dashboard`;

  // =================================================================
  // READ OPERATIONS
  // =================================================================

  getAllPosts(category?: number, page: number = 1, pageSize: number = 10): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (category !== undefined && category !== null) {
      params = params.set('category', category.toString());
    }
    
    // الرابط هو /list حسب Swagger
    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/list`, { params }); 
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.baseUrl}/${id}`);
  }

  // =================================================================
  // WRITE OPERATIONS
  // =================================================================

  createPost(data: any, files?: File[]): Observable<any> {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);

    // في الإنشاء الحقل اسمه attachments
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file); 
      });
    }

    return this.http.post(`${this.baseUrl}/create`, formData);
  }

  /**
   * دالة التعديل (هنا الحل لمشكلتك)
   */
  updatePost(id: number, data: any, files?: File[]): Observable<any> {
    const formData = new FormData();

    // 1. التصحيح: تغيير الاسم من id إلى postId ليطابق الباك إند
    formData.append('postId', id.toString());
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);

    // 2. التصحيح: تغيير الاسم من attachments إلى addedAttachments
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('addedAttachments', file);
      });
    }

    return this.http.put(`${this.baseUrl}/edit`, formData);
  }

  deletePost(id: number): Observable<ApiResponse<any>> {
    return this.http.request<ApiResponse<any>>('delete', `${this.baseUrl}/delete`, {
      body: { postId: id }
    });
  }

  // ... باقي الدوال (interact, addComment) كما هي
  interact(postId: number, type: InteractionType): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${postId}/interact`, { type });
  }

  addComment(postId: number, content: string, parentCommentId?: number): Observable<ApiResponse<Comment>> {
    const body = { postId, content, parentCommentId: parentCommentId || 0 };
    return this.http.post<ApiResponse<Comment>>(`${this.baseUrl}/comment`, body);
  }
}