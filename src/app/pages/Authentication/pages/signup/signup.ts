// src/app/pages/Public/Auth/pages/signup/signup.ts

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms'; 
import { AuthService } from '../../Service/auth';
import { RegisterRequest } from '../../models/auth';
// 1. تصحيح المسار هنا (مهم جداً)
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-signup',
  standalone: true,
  // الآن الأنجيولار سيتعرف على CommonModule ولن يظهر الخطأ
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData: RegisterRequest = {
    firstName: '',
    lastName: '',
    username: '', 
    email: '',
    password: '',
    isOrganization: false
  };

  isLoading = false;
  errorMessage: string | null = null;

  passwordPattern = "^(?=.*[a-z])(?=.*\\d).{6,}$";

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = 'Please fix the errors in the form.';
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.isSuccess) {
          console.log('Registration Successful');
          this.router.navigate(['/Login']); 
        } else {
          this.errorMessage = response.error?.message || 'Registration failed';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('HTTP Error:', err);
        this.errorMessage = 'A network error occurred. Please try again later.';
      }
    });
  }
}