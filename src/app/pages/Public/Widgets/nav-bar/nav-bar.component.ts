import { Component, OnInit, inject, OnDestroy, PLATFORM_ID, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../Authentication/Service/auth';
import { CATEGORY_THEMES } from '../feeds/models/categories';
import { GlobalSearchComponent } from './components/global-search/global-search';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, GlobalSearchComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isMenuOpen = false;
  isLoggedIn = false;
  currentUsername: string | null = null;
  hasNotifications = true;
  isProfileDropdownOpen = false;

  // المتغير اللي ماسك القسم الحالي
  currentActiveCat: any = null;

  private userSub!: Subscription;
  private routerSub!: Subscription;
  navLinks = Object.values(CATEGORY_THEMES);
  // Categories definition
  categories = [
    {
      id: 'community', name: 'Community', icon: 'bi-people-fill', route: '/public/community',
      topLinks: [
        { label: 'Feed', route: '/public/community' },
        { label: 'Explore', route: '/public/discover' },
        { label: 'My Communities', route: '/public/my-communities' }
      ]
    },
    {
      id: 'culture', name: 'Culture', icon: 'bi-mask', route: '/public/category/culture',
      topLinks: [
        { label: 'Feed', route: '/public/feed/culture' },
        { label: 'Exhibitions', route: '/public/culture/exhibitions' },
        { label: 'initiatives', route: '/public/initiatives/culture' }
      ]
    },
    {
      id: 'education', name: 'Education', icon: 'bi-journal-bookmark-fill', route: '/public/category/education',
      topLinks: [
        { label: 'Feed', route: '/public/feed/education' },
        { label: 'Courses', route: '/public/education/courses' },
        { label: 'initiatives', route: '/public/initiatives/schools' }
      ]
    },
    {
      id: 'Housing', name: 'Housing', icon: 'bi-house-door-fill', route: '/public/category/housing',
      topLinks: [
        { label: 'Feed', route: '/public/feed/housing' },
        { label: 'Properties', route: '/public/housing/properties' },
        { label: 'initiatives', route: '/public/initiatives/housing' }
      ]
    },
    {
      id: 'health', name: 'Health', icon: 'bi-heart-pulse-fill', route: '/public/coming-soon',
      topLinks: [
        { label: 'Feed', route: '/public/feed/health' },
        { label: 'Directors', route: '/public/health/directors' },
        { label: 'Initiatives', route: '/public/initiatives/health' }
      ]
    },
    {
      id: 'lifestyle', name: 'Lifestyle', icon: 'bi-person-arms-up', route: '/public/category/lifestyle',
      topLinks: [
        { label: 'Feed', route: '/public/lifestyle/feed' },
        { label: 'Trends', route: '/public/lifestyle/trends' },
        { label: 'initiatives', route: '/public/initiatives/lifestyle' }
      ]
    },
    {
      id: 'legal', name: 'Legal', icon: 'bi-bank2', route: '/public/category/legal',
      topLinks: [
        { label: 'Feed', route: '/public/feed/legal' },
        { label: 'Consult', route: '/public/legal/consult' },
        { label: 'initiatives', route: '/public/initiatives/legal' }
      ]
    },
    {
      id: 'news', name: 'News', icon: 'bi-newspaper', route: '/public/category/news',
      topLinks: [
        { label: 'Feed', route: '/public/feed/news' },
        { label: 'Latest', route: '/public/news/latest' },
        { label: 'initiatives', route: '/public/initiatives/news' }
      ]
    },
    {
      id: 'profession', name: 'Profession', icon: 'bi-briefcase-fill', route: '/public/profession/feed',
      topLinks: [
        { label: 'Feed', route: '/public/profession/feed' },
        { label: 'Jobs', route: '/public/profession/jobs' },
        { label: 'My Application', route: '/public/profession/my-applications' },
        { label: 'My Offers', route: '/public/profession/my-offers' }
      ]
    },
    {
      id: 'social', name: 'Social', icon: 'bi-globe', route: '/public/category/social',
      topLinks: [
        { label: 'Feed', route: '/public/feed/social' },
        { label: 'Campaigns', route: '/public/social/campaigns' },
        { label: 'initiatives', route: '/public/initiatives/social' }
      ]
    },
    {
      id: 'Transportation', name: 'Tourism', icon: 'bi-map-fill', route: '/public/category/transportation',
      topLinks: [
        { label: 'Feed', route: '/public/feed/Transportation' },
        { label: 'Map', route: '/public/tour/map' },
        { label: 'initiatives', route: '/public/initiatives/Transportation' }
      ]
    },
    {
      id: 'tv', name: 'TV', icon: 'bi-tv-fill', route: '/public/category/tv',
      topLinks: [
        { label: 'Feed', route: '/public/feed/tv' },
        { label: 'Live', route: '/public/tv/live' },
        { label: 'initiatives', route: '/public/initiatives/tv' }
      ]
    }
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

    // Listen to route changes
    this.routerSub = this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveCategory(event.urlAfterRedirects);
    });

    // Initial check
    if (isPlatformBrowser(this.platformId)) {
      this.updateActiveCategory(this.router.url);
    }
  }

  updateActiveCategory(url: string) {
    if (url === '/' || url === '/public/home' || url.includes('/public/home')) {
      this.currentActiveCat = null;
      return;
    }

    // Logic to keep buttons persistent if URL matches category route OR any of its sub-links
    const found = this.categories.find(cat => {
      const isMainRoute = url.startsWith(cat.route);
      const isSubRoute = cat.topLinks.some(link => url.startsWith(link.route));
      return isMainRoute || isSubRoute;
    });

    if (found) {
      this.currentActiveCat = found;
    } else {
      this.currentActiveCat = null;
    }
    this.cdr.detectChanges();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
    }
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    this.isProfileDropdownOpen = false;
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
    if (this.routerSub) this.routerSub.unsubscribe();
  }
}