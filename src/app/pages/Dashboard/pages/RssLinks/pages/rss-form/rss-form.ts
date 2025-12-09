// src/app/pages/Dashboard/pages/rss/rss-form/rss-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RssService } from '../../services/rss';
import { RssCategoryList, RssSource } from '../../models/rss';
// تأكد من المسارات

@Component({
  selector: 'app-rss-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rss-form.html',
  styleUrls: ['./rss-form.scss']
})
export class RssFormComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private rssService = inject(RssService);
  private router = inject(Router);
  private location = inject(Location);

  form!: FormGroup;
  isEditMode = false;
  editId: number | null = null;
  categories = RssCategoryList;
  
  isLoading = false;
  selectedFile: File | null = null;

  ngOnInit() {
    // Check if we have state data passed from List (Edit Mode)
    const state = history.state.data as RssSource;

    if (state && state.id) {
      this.isEditMode = true;
      this.editId = state.id;
      this.initEditForm(state);
    } else {
      this.initCreateForm();
    }
  }

  // --- Form for CREATE (Simple) ---
  initCreateForm() {
    this.form = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      category: [null, Validators.required]
    });
  }

  // --- Form for EDIT (Full) ---
  initEditForm(data: RssSource) {
    this.form = this.fb.group({
      name: [data.name, Validators.required],
      rssUrl: [data.rssUrl, Validators.required],
      category: [data.category, Validators.required],
      description: [data.description],
      isActive: [data.isActive]
    });
  }

  // --- File Handling ---
  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // --- Submit Logic ---
  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;

    if (this.isEditMode && this.editId) {
      // UPDATE Logic
      this.rssService.updateRssSource(this.editId, this.form.value, this.selectedFile || undefined)
        .subscribe({
          next: (res: any) => this.handleSuccess('Updated'),
          error: (err: any) => this.handleError(err)
        });
    } else {
      // CREATE Logic
      const payload = {
        url: this.form.value.url,
        category: +this.form.value.category
      };
      
      // الآن دالة createRssSource موجودة ولن تعطي خطأ
      this.rssService.createRssSource(payload)
        .subscribe({
          next: (res: any) => this.handleSuccess('Created'),
          error: (err: any) => this.handleError(err)
        });
    }
  }

  handleSuccess(action: string) {
    alert(`RSS Feed ${action} Successfully!`);
    this.isLoading = false;
    this.router.navigate(['/admin/rss']);
  }

  handleError(err: any) {
    console.error(err);
    alert('Operation failed.');
    this.isLoading = false;
  }

  goBack() {
    this.location.back();
  }
}