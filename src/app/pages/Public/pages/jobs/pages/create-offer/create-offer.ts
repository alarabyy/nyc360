import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { CreateOfferService } from '../../service/create-offer';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-offer.html',
  styleUrls: ['./create-offer.scss']
})
export class CreateOfferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private offerService = inject(CreateOfferService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef); // Inject CDR

  isSubmitting = false;
  locationSearchControl = new FormControl('');
  locationResults: any[] = [];
  showLocationResults = false;
  isSearchingLocation = false;

  // ✅ الفاليديشن لكل الحقول
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    responsibilities: ['', Validators.required],
    requirements: ['', Validators.required],
    benefits: ['', Validators.required],
    salaryMin: [null, [Validators.required, Validators.min(0)]],
    salaryMax: [null, [Validators.required, Validators.min(0)]],
    workArrangement: [0, Validators.required],
    employmentType: [0, Validators.required],
    employmentLevel: [1, Validators.required],
    locationId: [null, Validators.required]
  });

  ngOnInit() {
    this.setupLocationSearch();
  }

  setupLocationSearch() {
    this.locationSearchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(term => (term || '').length >= 2),
      switchMap(term => {
        this.isSearchingLocation = true;
        this.cdr.detectChanges(); // Update loader
        return this.offerService.searchLocations(term || '');
      })
    ).subscribe(res => {
      this.isSearchingLocation = false;
      this.locationResults = res.isSuccess ? res.data : [];
      this.showLocationResults = this.locationResults.length > 0;
      this.cdr.detectChanges(); // Update results
    });
  }

  selectLocation(loc: any) {
    this.form.get('locationId')?.setValue(loc.id);
    this.locationSearchControl.setValue(`${loc.neighborhood}, ${loc.borough}`, { emitEvent: false });
    this.showLocationResults = false;
    this.cdr.detectChanges(); // Update selection
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // دي اللي هتخلي رسائل الخطأ تظهر لو فيه حاجة ناقصة
      this.cdr.detectChanges(); // Ensure validation errors show
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges(); // Update loading state
    const val = this.form.value;

    // ✅ تحويل البيانات لـ PascalCase عشان الـ API يقبلها
    const payload = {
      Title: val.title,
      Description: val.description,
      Requirements: val.requirements,
      Benefits: val.benefits,
      Responsibilities: val.responsibilities,
      SalaryMin: val.salaryMin,
      SalaryMax: val.salaryMax,
      WorkArrangement: Number(val.workArrangement),
      EmploymentType: Number(val.employmentType),
      EmploymentLevel: Number(val.employmentLevel),
      LocationId: val.locationId
    };

    this.offerService.createOffer(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.isSuccess) {
          this.toastService.success('Job Offer Created Successfully!');
          this.router.navigate(['/public/profession/feed']);
        } else {
          this.toastService.error(res.error?.message || 'Failed to create offer');
        }
        this.cdr.detectChanges(); // Update final state
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.error('Server Error: Make sure all fields are valid.');
        this.cdr.detectChanges(); // Update error state
      }
    });
  }
}