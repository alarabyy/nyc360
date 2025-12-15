// src/app/pages/Dashboard/pages/posts/services/posts.service.ts

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
  private baseUrl = `${environment.apiBaseUrl}/posts`;

  // --- Read ---
  getAllPosts(category?: number, page: number = 1, pageSize: number = 10): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (category !== undefined && category !== null) params = params.set('category', category);
    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/list`, { params });
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.baseUrl}/${id}`);
  }

  // --- Create/Update/Delete ---
  createPost(data: any, file?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.category !== null) formData.append('category', data.category.toString());
    if (file) formData.append('image', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/create`, formData);
  }

  updatePost(id: number, data: any, file?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('postId', id.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.category !== null) formData.append('category', data.category.toString());
    if (file) formData.append('image', file);
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/edit`, formData);
  }

  deletePost(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/delete`, { body: { postId: id } });
  }

  // --- Interactions ---
  interact(postId: number, type: InteractionType): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${postId}/interact`, { type });
  }

  // --- Comments ---
  addComment(postId: number, content: string, parentCommentId?: number): Observable<ApiResponse<Comment>> {
    const body = { 
      postId, 
      content, 
      parentCommentId: parentCommentId || 0 
    };
    return this.http.post<ApiResponse<Comment>>(`${this.baseUrl}-dashboard/comment`, body);
  }
}