import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Supply} from '../../model/supply.entity';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-supply-carousel',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe, MatButtonModule],
  templateUrl: './supply-carousel.component.html',
  styleUrls: ['./supply-carousel.component.css']
})
export class SupplyCarouselComponent implements AfterViewInit, OnChanges {
  @Input() supplies: Supply[] = [];
  @Input() categories: string[] = [];
  @Output() edit = new EventEmitter<Supply>();
  @Output() delete = new EventEmitter<Supply>();

  @ViewChild('container') private container?: ElementRef<HTMLElement>;

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.updateScrollState());
  }

  ngOnChanges(_changes: SimpleChanges): void {
    queueMicrotask(() => this.updateScrollState());
  }

  @HostListener('window:resize')
  onViewportResize(): void {
    this.updateScrollState();
  }

  getCategoryName(supply: Supply): string {
    const category = supply.category as unknown;
    if (typeof category === 'string') return category;
    return (category as {name?: string})?.name ?? 'Uncategorized';
  }

  scroll(direction: 'left' | 'right'): void {
    const element = this.container?.nativeElement;
    if (!element) return;

    const distance = Math.max(280, Math.round(element.clientWidth * .82));
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });

    window.setTimeout(() => this.updateScrollState(), 360);
  }

  onScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const element = this.container?.nativeElement;
    if (!element) return;

    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
    this.canScrollLeft.set(element.scrollLeft > 4);
    this.canScrollRight.set(maxScrollLeft - element.scrollLeft > 4);
  }
}
