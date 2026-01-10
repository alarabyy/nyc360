import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommunityPostService, LocationSearchResult } from '../../services/community-post';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-create-community-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-community-post.html',
  styleUrls: ['./create-community-post.scss']
})
export class CreateCommunityPostComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private locationService = inject(Location);
  private postService = inject(CommunityPostService);
  private cdr = inject(ChangeDetectorRef);

  // Data
  communityId: number = 0;
  title: string = '';        // ✅ Added Title
  content: string = '';
  
  // Tags & Location Logic
  tags: string[] = [];       // ✅ Tags array to send to backend
  locationQuery: string = '';
  locationResults: LocationSearchResult[] = [];
  showLocationDropdown = false;
  searchSubject = new Subject<string>(); // For Debouncing

  // Images
  images: File[] = [];
  imagesPreview: string[] = [];
  isPosting = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.communityId = +id;

    // ✅ Setup Live Search with Debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) return [];
        return this.postService.searchLocations(query);
      })
    ).subscribe({
      next: (res: any) => {
        if (Array.isArray(res.data)) {
          this.locationResults = res.data;
          this.showLocationDropdown = true;
        } else {
          this.locationResults = [];
        }
      },
      error: () => this.locationResults = []
    });
  }

  // --- Location Search ---
  onSearchInput(event: any) {
    const val = event.target.value;
    this.locationQuery = val;
    if (val.length >= 2) {
      this.searchSubject.next(val);
    } else {
      this.showLocationDropdown = false;
    }
  }

  selectLocation(loc: LocationSearchResult) {
    // هنضيف اسم المكان كـ تاج (Tag)
    // وممكن نضيفه للكود او العنوان
    const locTag = loc.neighborhood || loc.borough;
    if (!this.tags.includes(locTag)) {
      this.tags.push(locTag);
    }
    
    // Reset Search
    this.locationQuery = '';
    this.showLocationDropdown = false;
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  // --- Images ---
  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.images.push(...files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagesPreview.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesPreview.splice(index, 1);
  }

  // --- Submit ---
  submitPost() {
    if ((!this.content.trim() && !this.title.trim()) && this.images.length === 0) return;

    this.isPosting = true;

    this.postService.createPost({
      communityId: this.communityId,
      title: this.title,
      content: this.content,
      tags: this.tags, // ✅ Sending Locations inside Tags
      attachments: this.images
    }).subscribe({
      next: (res) => {
        this.isPosting = false;
        if (res.isSuccess) {
          this.locationService.back();
        } else {
          alert(res.error?.message || 'Failed to create post');
        }
      },
      error: () => {
        this.isPosting = false;
        alert('Network error');
      }
    });
  }

  cancel() {
    this.locationService.back();
  }
}