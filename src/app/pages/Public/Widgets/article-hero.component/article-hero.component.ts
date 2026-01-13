import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-article-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-hero.component.html',
  styleUrls: ['./article-hero.component.scss']
})
export class ArticleHeroComponent {
  @Input() image: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() metaText: string = '';
  @Input() link: any;
  @Input() customColor: string = '#00695C';
}