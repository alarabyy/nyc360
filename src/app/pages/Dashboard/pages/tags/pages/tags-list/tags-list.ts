// tags-list.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TagModel, TagType } from '../../models/tags.model';
import { CATEGORY_LIST } from '../../../../../models/category-list';
import { TagsService } from '../../service/tags-dashboard.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-tags-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tags-list.html',
  styleUrls: ['./tags-list.scss']
})
export class TagsListComponent implements OnInit {
  private tagsService = inject(TagsService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  tags: TagModel[] = [];
  categories = CATEGORY_LIST;

  // Filtering & Search
  searchTerm = '';
  selectedDiv = -1;
  selectedType = -1;

  // Pagination Metadata
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  totalCount = 0;
  isLoading = false;

  // Stats
  stats = [
    { title: 'Total Tags', value: 0, icon: 'bi-tags-fill', color: 'gold' },
    { title: 'System Types', value: 4, icon: 'bi-diagram-3-fill', color: 'blue' },
    { title: 'Active Divisions', value: 12, icon: 'bi-grid-fill', color: 'green' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData(page: number = 1) {
    this.currentPage = page;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.tagsService.getAllTags(
      this.searchTerm,
      this.selectedType,
      this.selectedDiv,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.tags = res.data || [];
          this.totalPages = res.totalPages;
          this.totalCount = res.totalCount;

          // Update Stats
          this.stats[0].value = this.totalCount;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Network Error:', err);
        this.toastService.error('Failed to load tags data');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    this.loadData(1);
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this tag?')) {
      this.tagsService.deleteTag(id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastService.success('Tag deleted successfully');
            this.loadData(this.currentPage);
          } else {
            this.toastService.error('Failed to delete tag');
          }
        },
        error: (err) => {
          this.toastService.error('Error deleting tag');
        }
      });
    }
  }

  copyId(id: number) {
    navigator.clipboard.writeText(id.toString());
    this.toastService.info('Tag ID copied to clipboard');
  }

  // Helpers
  getCatName(id: number) { return this.categories.find(c => c.id === id)?.name || 'General'; }
  getTypeName(type: number) {
    const types: any = { 1: 'Identity', 2: 'Professional', 3: 'Interest', 4: 'Location' };
    return types[type] || 'General';
  }

  getAvatarColor(name: string): string {
    const colors = ['#FF7F50', '#2E86C1', '#28B463', '#884EA0', '#D35400', '#D4AF37'];
    const index = name.length % colors.length;
    return colors[index];
  }
}