import { Directive, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[dragScrollX]',
  standalone: true,
})
export class DragScrollXDirective {
  private isBrowser = false;

  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private moved = false;

  constructor(
    private elRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private get el() {
    return this.elRef.nativeElement;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (!this.isBrowser) return;

    this.isDown = true;
    this.moved = false;
    this.el.classList.add('is-dragging');
    this.startX = e.pageX;
    this.scrollLeft = this.el.scrollLeft;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isBrowser || !this.isDown) return;

    const dx = e.pageX - this.startX;
    if (Math.abs(dx) > 3) this.moved = true;

    this.el.scrollLeft = this.scrollLeft - dx;
    e.preventDefault();
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    if (!this.isBrowser) return;

    this.isDown = false;
    this.el.classList.remove('is-dragging');
  }

  // Prevent "click" firing after a drag (so you don’t accidentally navigate)
  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (!this.isBrowser) return;

    if (this.moved) {
      e.stopPropagation();
      e.preventDefault();
      this.moved = false;
    }
  }

  // Touch support (mobile)
  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    if (!this.isBrowser) return;

    this.isDown = true;
    this.moved = false;
    this.el.classList.add('is-dragging');
    this.startX = e.touches[0].pageX;
    this.scrollLeft = this.el.scrollLeft;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (!this.isBrowser || !this.isDown) return;

    const dx = e.touches[0].pageX - this.startX;
    if (Math.abs(dx) > 3) this.moved = true;

    this.el.scrollLeft = this.scrollLeft - dx;
  }

  @HostListener('touchend')
  onTouchEnd() {
    if (!this.isBrowser) return;

    this.isDown = false;
    this.el.classList.remove('is-dragging');
  }
}
