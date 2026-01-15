// tags-list.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TagModel, TagType } from '../../models/tags.model';
import { CATEGORY_LIST } from '../../../../../models/category-list';
import { TagsService } from '../../service/tags-dashboard.service';

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

  ngOnInit() {
    this.loadData();
  }

  loadData(page: number = 1) {
    this.currentPage = page;
    this.isLoading = true;
    this.cdr.detectChanges(); // لإظهار الـ Spinner

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
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // تحديث الواجهة بعد وصول البيانات
      },
      error: (err) => {
        console.error('Network Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    this.loadData(1); // تصفير للبداية عند تغيير أي فلتر
  }

  onDelete(id: number) {
    if(confirm('Are you sure you want to delete this tag?')) {
      this.tagsService.deleteTag(id).subscribe({
        next: (res) => { if (res.isSuccess) this.loadData(this.currentPage); }
      });
    }
  }

  // Helpers
  getCatName(id: number) { return this.categories.find(c => c.id === id)?.name || 'General'; }
  getTypeName(type: number) { 
    const types: any = { 1: 'Identity', 2: 'Professional', 3: 'Interest', 4: 'Location' };
    return types[type] || 'General';
  }
}