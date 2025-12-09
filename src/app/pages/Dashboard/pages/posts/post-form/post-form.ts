// src/app/pages/Dashboard/pages/posts/post-form/post-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../services/posts';
import { PostCategoryList } from '../models/posts';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrls: ['./post-form.scss']
})
export class PostFormComponent implements OnInit {
  
  // --- Dependencies ---
  private fb = inject(FormBuilder);
  private postsService = inject(PostsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  // --- State ---
  form: FormGroup;
  isEditMode = false;
  postId: number | null = null;
  categories = PostCategoryList;
  isLoading = false;
  
  // --- File Handling ---
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    // Initialize Form with Validation
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      category: [null, Validators.required]
    });
  }

  ngOnInit() {
    // Check if Edit Mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.postId = +idParam;
      this.loadPostData(this.postId);
    }
  }

  // --- Load Data for Edit ---
  loadPostData(id: number) {
    this.isLoading = true;
    this.postsService.getPostById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          // Populate Form
          this.form.patchValue({
            title: res.data.title,
            content: res.data.content,
            category: res.data.category
          });
          // TODO: If you want to show existing image, set imagePreview here using env URL
        }
      },
      error: () => this.isLoading = false
    });
  }

  // --- Handle File Input ---
  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      
      // Generate Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  // --- Submit ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Show errors
      return;
    }

    this.isLoading = true;

    const request$ = this.isEditMode && this.postId
      ? this.postsService.updatePost(this.postId, this.form.value, this.selectedFile || undefined)
      : this.postsService.createPost(this.form.value, this.selectedFile || undefined);

    request$.subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          alert(this.isEditMode ? 'Post Updated Successfully!' : 'Post Created Successfully!');
          this.router.navigate(['/admin/posts']);
        } else {
          alert(res.error?.message || 'Operation failed.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('Network Error.');
      }
    });
  }

  goBack() {
    this.location.back();
  }
}