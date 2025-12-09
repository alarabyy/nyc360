import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Post, PostCategoryList } from '../models/posts';
import { PostsService } from '../services/posts';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss']
})
export class PostListComponent implements OnInit {
  
  // Expose environment to HTML
  protected readonly environment = environment;
  
  // Dependencies
  private postsService = inject(PostsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // State
  posts: Post[] = [];
  isLoading = true;
  errorMessage = '';
  categories = PostCategoryList;

  ngOnInit() {
    this.loadPosts();
  }

  /**
   * Load all posts from the server
   */
  loadPosts() {
    this.isLoading = true;
    this.postsService.getAllPosts().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          // Ensure data is an array
          this.posts = Array.isArray(res.data) ? res.data : [];
          this.cdr.detectChanges(); // Force UI update
        } else {
          this.errorMessage = res.error?.message || 'Failed to load posts.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Helper to convert Category ID to Name
   */
  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  /**
   * Delete Post Action
   */
  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postsService.deletePost(id).subscribe({
        next: () => this.loadPosts(),
        error: () => alert('Failed to delete post.')
      });
    }
  }
}