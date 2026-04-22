import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchService } from '../../../resource/inventory/services/batch.service';
import { Batch } from '../../../resource/inventory/model/batch.entity';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-restaurant-last-supplies-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './restaurant-last-supplies-widget.component.html',
  styleUrls: ['./restaurant-last-supplies-widget.component.css']
})
export class RestaurantLastSuppliesWidgetComponent implements OnInit {
  batches: Batch[] = [];

  @ViewChild('carouselContainer', { static: false }) containerRef!: ElementRef<HTMLDivElement>;

  constructor(private batchService: BatchService) {}

  async ngOnInit(): Promise<void> {
    const all = await this.batchService.getAllBatchesWithSupplies();
    this.batches = [...all]
      .sort((a, b) => {
        const aDate = (a as any).created_at || a.id || 0;
        const bDate = (b as any).created_at || b.id || 0;
        return bDate - aDate;
      })
      .slice(0, 10);
  }

  scrollLeft(container: HTMLElement): void {
    container.scrollLeft -= 250;
  }

  scrollRight(container: HTMLElement): void {
    container.scrollLeft += 250;
  }

  getPairs() {
    const pairs: Batch[][] = [];
    for (let i = 0; i < this.batches.length; i += 2) {
      pairs.push(this.batches.slice(i, i + 2));
    }
    return pairs;
  }
}
