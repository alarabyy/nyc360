import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  
  form!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  // --- 1. User Types Data ---
  selectionOptions = [
    { id: 'visitor', title: 'Visitor', icon: 'bi-airplane-engines', desc: 'Exploring NYC for a visit.' },
    { id: 'new-yorker', title: 'New Yorker', icon: 'bi-houses', desc: 'Living in the five boroughs.' },
    { id: 'organization', title: 'Organization', icon: 'bi-building', desc: 'Business or Non-Profit entity.' }
  ];

  // --- 2. Interests Data (Mapped to Backend Enum IDs) ---
  // Order matters: 0=Art, 1=Community, etc.
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
    this.selectedInterestIds = []; // Reset interests
  }

  initForm() {
    // Reset selection
    this.selectedInterestIds = [];

    if (this.isOrganization) {
      // --- ORGANIZATION FORM ---
      this.form = this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    } else {
      // --- NORMAL USER FORM ---
      this.form = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  }

  // --- Interest Selection Logic ---
  toggleInterest(id: number) {
    const index = this.selectedInterestIds.indexOf(id);
    if (index >= 0) {
      this.selectedInterestIds.splice(index, 1); // Remove
    } else {
      this.selectedInterestIds.push(id); // Add
    }
  }

  isSelected(id: number): boolean {
    return this.selectedInterestIds.includes(id);
  }

  // --- Submission ---
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.selectedInterestIds.length === 0) {
      this.errorMessage = "Please select at least one area of interest.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    // Merge Form Data with Selected Interests
    const formData = { 
      ...this.form.value, 
      interests: this.selectedInterestIds 
    };

    if (this.isOrganization) {
      // Call Organization Endpoint
      this.authService.registerOrganization(formData).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else {
      // Call Normal User Endpoint
      // Ensure 'userType' is strictly 'Visitor' or 'NewYorker' (PascalCase often preferred by C# APIs)
      const payload = { 
        ...formData, 
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
      this.router.navigate(['/auth/Login']);
    } else {
      this.errorMessage = res.error?.message || 'Registration failed.';
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    console.error(err);
    this.errorMessage = 'Network error occurred.';
  }

  getFormTitle(): string {
    if (this.selectedType === 'organization') return 'Partner Registration';
    if (this.selectedType === 'new-yorker') return 'Join the Neighborhood';
    return 'Start Your Journey';
  }
}