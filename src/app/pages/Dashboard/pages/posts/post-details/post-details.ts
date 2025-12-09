import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { PostsService } from '../services/posts';
import { Post, PostCategoryList } from '../models/posts';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-details.html',
  styleUrls: ['./post-details.scss']
})
export class PostDetailsComponent implements OnInit {
  
  // Expose environment for image URLs
  protected readonly environment = environment;

  // --- Dependencies ---
  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);

  // --- State ---
  post: Post | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Helper for Categories
  categories = PostCategoryList;

  ngOnInit() {
    this.loadPost();
  }

  /**
   * Fetches the Post ID from URL and loads data
   */
  loadPost() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading = true;
    
    this.postsService.getPostById(+id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.post = res.data;
        } else {
          this.errorMessage = res.error?.message || 'Post not found.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error loading post.';
        console.error(err);
      }
    });
  }

  /**
   * Helper to get Category Name
   */
  getCategoryName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || 'General';
  }
}