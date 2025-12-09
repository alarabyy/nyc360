import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core'; // 1. استيراد PLATFORM_ID
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'; // 2. استيراد isPlatformBrowser
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  providers: [DatePipe]
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID); // 3. حقن معرف المنصة
  
  isMenuOpen = false;
  currentDate = new Date();
  isLoggedIn = false;
  currentUsername: string | null = null;
  canViewDashboard = false;
  
  private userSub!: Subscription;

  categories = [
    { name: 'Art', link: '/art', color: '#FD7E14' },
    { name: 'Community', link: '/community', color: '#E35D6A' },
    { name: 'Culture', link: '/culture', color: '#DC3545' },
    { name: 'Education', link: '/education', color: '#6610f2' },
    { name: 'Events', link: '/events', color: '#D63384' },
    { name: 'Lifestyle', link: '/lifestyle', color: '#6F42C1' },
    { name: 'Media', link: '/media', color: '#20c997' },
    { name: 'News', link: '/news', color: '#198754' },
    { name: 'Recruitment', link: '/recruitment', color: '#A5673F' },
    { name: 'Social', link: '/social', color: '#75B798' },
    { name: 'Tourism', link: '/Tourism', color: '#FFC107' },
    { name: 'TV', link: '/tv', color: '#0D6EFD' }
  ];

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;
        this.canViewDashboard = this.authService.hasPermission('Permissions.Dashboard.View');
      } else {
        this.resetPermissions();
      }
    });
  }

  resetPermissions() {
    this.currentUsername = null;
    this.canViewDashboard = false;
  }

  toggleMenu() { 
    this.isMenuOpen = !this.isMenuOpen; 
    
    // 4. التحقق من أننا في المتصفح قبل استخدام document
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
  }
  
  logout() {
    this.authService.logout();
    this.isMenuOpen = false; // تحديث الحالة فقط
    
    // إعادة الـ Scroll في المتصفح فقط
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();

    // 5. التحقق من أننا في المتصفح قبل استخدام document
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto'; 
    }
  }
}