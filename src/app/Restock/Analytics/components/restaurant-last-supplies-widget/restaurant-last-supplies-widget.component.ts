import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Batch } from '../../../resource/inventory/model/batch.entity';
import { InventoryDataService } from '../../../resource/inventory/services/inventory-data.service';
import { SessionService } from '../../../../shared/services/session.service';

@Component({
  selector: 'app-restaurant-last-supplies-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './restaurant-last-supplies-widget.component.html',
  styleUrls: ['./restaurant-last-supplies-widget.component.css']
})
export class RestaurantLastSuppliesWidgetComponent implements OnInit {
  batches: Batch[] = [];
  isLoading = true;
  hasError = false;

  @ViewChild('carouselContainer', { static: false }) containerRef?: ElementRef<HTMLDivElement>;

  constructor(
    private readonly inventoryData: InventoryDataService,
    private readonly session: SessionService
  ) {}

  async ngOnInit(): Promise<void> {
    const userId = this.session.getUserId();
    if (!userId) {
      this.isLoading = false;
      this.hasError = true;
      return;
    }

    try {
      const snapshot = await this.inventoryData.load(userId);
      this.batches = [...snapshot.batches]
        .sort((a, b) => {
          const aValue = Number((a as any).created_at ?? a.id ?? 0);
          const bValue = Number((b as any).created_at ?? b.id ?? 0);
          return bValue - aValue;
        })
        .slice(0, 12);
    } catch (error) {
      console.error('Error loading recent supplies:', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  scroll(direction: -1 | 1): void {
    const container = this.containerRef?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: direction * Math.max(260, container.clientWidth * .72), behavior: 'smooth' });
  }
}
