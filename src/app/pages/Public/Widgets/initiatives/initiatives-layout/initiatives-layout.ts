import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../feeds/services/posts';

@Component({
    standalone: true,
  selector: 'app-initiatives-layout',
  templateUrl: './initiatives-layout.html',
  styleUrls: ['./initiatives-layout.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class InitiativesLayoutComponent implements OnInit {
  initiatives: any[] = [];
  loading = true;

  // إعدادات الثيم
  currentCategory = 0;
  pageTitle = '';
  themeColor = '#00c3ff';

  // البحث والفلاتر
  searchQuery = '';
  
  // الباجينيشن
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.currentCategory = data['categoryEnum'];
      this.pageTitle = data['title'];
      this.themeColor = data['themeColor'];

      this.applyTheme(this.themeColor);
      this.loadInitiatives();
    });
  }

  applyTheme(color: string) {
    if (this.el.nativeElement) {
      this.renderer.setStyle(this.el.nativeElement, '--theme-color', color);
      // لون خفيف للخلفيات والفلاتر النشطة
      this.renderer.setStyle(this.el.nativeElement, '--theme-light', color + '1a'); // 10% opacity hex code approx
    }
  }

  loadInitiatives() {
    this.loading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      category: this.currentCategory,
      type: 4, // 4 = Initiative حسب الـ Enum
      search: this.searchQuery
    };

    this.postsService.getFeed(params).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.initiatives = this.mapData(res.data);
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load initiatives', err);
        this.loading = false;
      }
    });
  }

  mapData(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      // صورة افتراضية في حالة عدم وجود صورة
      image: item.attachments?.[0]?.url || 'assets/images/placeholder-initiative.jpg',
      // استخدام العنوان والوصف
      title: item.title,
      description: item.content,
      // تنسيق التاريخ والمكان
      date: item.createdAt,
      locationName: item.location?.neighborhood || 'NYC Wide',
      // اسم المؤسسة أو الناشر
      organizer: item.author?.fullName || 'Community Organization'
    }));
  }

  onSearch() {
    this.currentPage = 1;
    this.loadInitiatives();
  }
}