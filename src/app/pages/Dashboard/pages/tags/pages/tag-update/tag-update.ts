import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

// Services & Models
import { TagRequest, TagModel } from '../../models/tags.model';
import { CATEGORY_LIST } from '../../../../../models/category-list';
import { TagsService } from '../../service/tags-dashboard.service';

@Component({
  selector: 'app-tag-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tag-update.html',
  styleUrls: ['./tag-update.scss']
})
export class TagUpdateComponent implements OnInit {
  private tagsService = inject(TagsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Data
  tagId: string | null = null;
  categories = CATEGORY_LIST;
  isLoading = true;
  isSubmitting = false;
  formSubmitted = false;

  // Form Fields
  tagName: string = '';
  selectedDivision: number | null = null;
  selectedType: number = 3; 
  parentTagId: number = 0; 

  // Search Logic for Parent
  parentSearchTerm$ = new Subject<string>();
  parentSearchResults: TagModel[] = [];
  selectedParentName: string = 'NONE (TOP LEVEL)';

  ngOnInit(): void {
    this.tagId = this.route.snapshot.paramMap.get('id');
    if (this.tagId) {
      this.fetchInitialData();
    }

    // إعداد البحث اللحظي عن التاج الأب
    this.parentSearchTerm$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => term.length > 0 ? this.tagsService.searchTags(term) : [])
    ).subscribe({
      next: (res: any) => {
        this.parentSearchResults = res.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  fetchInitialData(): void {
    this.isLoading = true;
    // جلب بيانات التاج الحالي لملء الحقول
    this.tagsService.getAllTags('', undefined, undefined).subscribe({
      next: (res) => {
        const currentTag = res.data.find(t => t.id.toString() === this.tagId);
        if (currentTag) {
          this.tagName = currentTag.name;
          this.selectedDivision = currentTag.division;
          this.selectedType = currentTag.type;
          // ملاحظة: لو الباك إند بيبعت اسم الأب عرضه هنا، لو لأ بنسيبه NONE لحد ما يسرش
          this.selectedParentName = currentTag.parent ? currentTag.parent.toUpperCase() : 'NONE (TOP LEVEL)';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  onSearchParent(event: any) {
    this.parentSearchTerm$.next(event.target.value);
  }

  selectParent(tag: any) {
    if (tag === 0) {
      this.parentTagId = 0;
      this.selectedParentName = 'NONE (TOP LEVEL)';
    } else {
      this.parentTagId = tag.id;
      this.selectedParentName = tag.name.toUpperCase();
    }
    this.parentSearchResults = [];
  }

  onSubmit(event: Event) {
    event.preventDefault(); // ✅ منع ريلود الصفحة
    this.formSubmitted = true;

    if (!this.tagName.trim() || this.selectedDivision === null || !this.tagId) return;

    this.isSubmitting = true;
    
    // ✅ البيانات كاملة بأسلوب PascalCase كما يطلب السيرفر
    const payload: TagRequest = {
      Name: this.tagName.trim(),
      Type: Number(this.selectedType),
      Division: Number(this.selectedDivision),
      ParentTagId: Number(this.parentTagId)
    };

    this.tagsService.updateTag(this.tagId, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.router.navigate(['/admin/tags']);
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(`Error: ${err.error?.Message || 'Update Failed'}`);
        this.cdr.detectChanges();
      }
    });
  }

  onCancel() { this.router.navigate(['/admin/tags']); }
}