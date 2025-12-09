// src/app/pages/Dashboard/pages/rss/rss-list/rss-list.component.ts

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { RssService } from '../../services/rss';
import { RssCategoryList, RssSource } from '../../models/rss';

@Component({
  selector: 'app-rss-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rss-list.html',
  styleUrls: ['./rss-list.scss']
})
export class RssListComponent implements OnInit {
  
  // Make environment public for HTML
  protected readonly environment = environment;
  
  // Dependencies
  private rssService = inject(RssService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // <--- Critical for updates

  // State
  rssList: RssSource[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Category Helper
  categories = RssCategoryList;

  ngOnInit() {
    this.loadRssFeeds();
  }

  loadRssFeeds() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rssService.getAllRssSources().subscribe({
      next: (res) => {
        console.log('RSS Response:', res); // Debug check

        if (res.isSuccess) {
          // Safely assign data (handle null cases)
          this.rssList = res.data || [];
        } else {
          this.errorMessage = res.error?.message || 'Failed to load RSS feeds.';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); // <--- Force UI to render data
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network Error.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  // Helper to get Category Name from ID (e.g. 1 -> "Community")
  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }

  onDelete(id: number) {
    if(confirm('Are you sure you want to delete this source?')) {
      this.isLoading = true; // Show spinner while deleting
      this.rssService.deleteRssSource(id).subscribe({
        next: () => {
          this.loadRssFeeds(); // Reload list
        },
        error: () => {
          alert('Failed to delete.');
          this.isLoading = false;
        }
      });
    }
  }

  onEdit(item: RssSource) {
    this.router.navigate(['/admin/rss/edit'], { state: { data: item } }); 
  }
}