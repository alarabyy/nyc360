import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { AuthService } from '../../Service/auth'; 

@Component({
  selector: 'app-register-selection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-selection.html',
  styleUrls: ['./register-selection.scss'],
  animations: [
    // Fade & Slide Animation for View Switching
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    // Staggered Animation for Cards
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class RegisterSelectionComponent {

  // --- Dependencies ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // --- State ---
  currentStep: 'selection' | 'form' = 'selection';
  selectedType: string = ''; 
  isOrganization = false;
  
  form!: FormGroup; // Use definite assignment assertion
  isLoading = false;
  errorMessage: string | null = null;

  // --- 1. User Types Data ---
  selectionOptions = [
    { id: 'visitor', title: 'Visitor', icon: 'bi-airplane-engines', desc: 'Exploring NYC for a visit.' },
    { id: 'new-yorker', title: 'New Yorker', icon: 'bi-houses', desc: 'Living in the five boroughs.' },
    { id: 'organization', title: 'Organization', icon: 'bi-building', desc: 'Business or Non-Profit entity.' }
  ];

  // --- 2. Interests Data (Mapped to Backend Enum IDs) ---
  interestsList = [
    { id: 0, name: 'Art', icon: 'bi-palette' },
    { id: 1, name: 'Community', icon: 'bi-people' },
    { id: 2, name: 'Culture', icon: 'bi-mask' },
    { id: 3, name: 'Education', icon: 'bi-mortarboard' },
    { id: 4, name: 'Events', icon: 'bi-calendar-event' },
    { id: 5, name: 'Lifestyle', icon: 'bi-cup-hot' },
    { id: 6, name: 'Media', icon: 'bi-collection-play' },
    { id: 7, name: 'News', icon: 'bi-newspaper' },
    { id: 8, name: 'Recruitment', icon: 'bi-briefcase' },
    { id: 9, name: 'Social', icon: 'bi-chat-heart' },
    { id: 10, name: 'Tourism', icon: 'bi-airplane' },
    { id: 11, name: 'TV', icon: 'bi-tv' }
  ];

  // Track selected interest IDs
  selectedInterestIds: number[] = [];

  // --- Methods ---

  onSelect(typeId: string) {
    this.selectedType = typeId;
    this.isOrganization = typeId === 'organization';
    this.currentStep = 'form';
    this.initForm();
  }

  goBack() {
    this.currentStep = 'selection';
    this.errorMessage = null;
    this.form.reset();
    this.selectedInterestIds = []; 
  }

  initForm() {
    this.selectedInterestIds = [];
    
    // Common validators
    const passwordValidators = [
      Validators.required, 
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*\d).{6,}$/) // At least 1 lowercase, 1 digit
    ];

    if (this.isOrganization) {
      // --- ORGANIZATION FORM ---
      this.form = this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
      });
    } else {
      // --- NORMAL USER FORM ---
      this.form = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
        terms: [false, Validators.requiredTrue]
      });
    }
  }

  // --- Interest Selection Logic ---
  toggleInterest(id: number) {
    const index = this.selectedInterestIds.indexOf(id);
    if (index >= 0) {
      this.selectedInterestIds.splice(index, 1); 
    } else {
      this.selectedInterestIds.push(id); 
    }
  }

  isSelected(id: number): boolean {
    return this.selectedInterestIds.includes(id);
  }

  // --- Helper for Template Validation ---
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // --- Submission ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Trigger validation messages
      return;
    }

    if (this.selectedInterestIds.length === 0) {
      this.errorMessage = "Please select at least one area of interest.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const formValue = this.form.value;
    // Don't send 'terms' to backend usually
    const { terms, ...submitData } = formValue; 

    const finalData = { 
      ...submitData, 
      interests: this.selectedInterestIds 
    };

    if (this.isOrganization) {
      this.authService.registerOrganization(finalData).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else {
      const payload = { 
        ...finalData, 
        userType: this.selectedType === 'new-yorker' ? 'NewYorker' : 'Visitor' 
      };
      
      this.authService.registerNormalUser(payload).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(res: any) {
    this.isLoading = false;
    if (res.isSuccess) {
      this.router.navigate(['/auth/login']); 
    } else {
      this.errorMessage = res.error?.message || 'Registration failed.';
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    console.error(err);
    this.errorMessage = 'Network error occurred. Please try again.';
  }

  getFormTitle(): string {
    if (this.selectedType === 'organization') return 'Partner Registration';
    if (this.selectedType === 'new-yorker') return 'Join the Neighborhood';
    return 'Start Your Journey';
  }
}