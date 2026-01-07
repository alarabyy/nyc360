import { Component, OnInit, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  isMenuOpen = false;
  isLoggedIn = false;
  currentUsername: string | null = null;
  hasNotifications = true; 
  
  private userSub!: Subscription;

  // 🔥 Categories Updated with specific routes
  categories = [
    { id: 'all', name: 'All', icon: 'bi-grid-fill', route: '/public/home' }, 
    { id: 'community', name: 'Community', icon: 'bi-people-fill', route: '/public/community' },
    { id: 'culture', name: 'Culture', icon: 'bi-palette-fill', route: '/culture' },
    { id: 'education', name: 'Education', icon: 'bi-mortarboard-fill', route: '/education' },
    { id: 'events', name: 'Events', icon: 'bi-calendar-event-fill', route: '/events' },
    { id: 'health', name: 'Health', icon: 'bi-heart-fill', route: '/health' },
    { id: 'legal', name: 'Legal', icon: 'bi-hammer', route: '/legal' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'bi-person-arms-up', route: '/lifestyle' },
    { id: 'news', name: 'News', icon: 'bi-newspaper', route: '/news' },
    { id: 'profession', name: 'Profession', icon: 'bi-briefcase-fill', route: '/profession' },
    { id: 'social', name: 'Social', icon: 'bi-globe', route: '/social' },
    { id: 'tour', name: 'Tour', icon: 'bi-airplane-fill', route: '/tour' },
    { id: 'tv', name: 'TV', icon: 'bi-tv-fill', route: '/tv' }
  ];

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;
      } else {
        this.currentUsername = null;
      }
    });
  }

  toggleMenu() { 
    this.isMenuOpen = !this.isMenuOpen; 
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }
  }
  
  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}