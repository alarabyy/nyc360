// src/app/pages/Dashboard/pages/posts/services/posts.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostsResponse } from '../models/posts';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/posts`;

  // --- GET ALL ---
  getAllPosts(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.baseUrl}/list`);
  }

  // --- GET BY ID ---
getPostById(id: number): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${environment.apiBaseUrl}/posts-dashboard/${id}`);
  }
  // --- CREATE (Multipart) ---
  createPost(data: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    // Ensure category is sent as string (Backend requirement for FormData)
    if (data.category !== null) {
      formData.append('category', data.category.toString());
    }

    // Append File only if exists
    if (file) {
      formData.append('image', file);
    }

    return this.http.post(`${this.baseUrl}/create`, formData);
  }

  // --- UPDATE (Multipart) ---
  updatePost(id: number, data: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('postId', id.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.category !== null) {
      formData.append('category', data.category.toString());
    }

    if (file) {
      formData.append('image', file);
    }

    return this.http.put(`${this.baseUrl}/edit`, formData);
  }



// DELETE
// /api/posts-dashboard/delete
  // --- DELETE ---
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}-dashboard/delete`, { body: { postId: id } });
  }
}