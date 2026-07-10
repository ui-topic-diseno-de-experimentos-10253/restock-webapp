import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {MatCard} from '@angular/material/card';
import {Batch} from '../../model/batch.entity';
import {TranslatePipe} from '@ngx-translate/core';
import {BatchDetailsComponent} from '../batch-details/batch-details.component';
import {BaseModalService} from '../../../../../shared/services/base-modal.service';
import {RotationAnalyticsService} from '../../services/rotation-analytics.service';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatCard,
    TranslatePipe
  ],
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css']
})
/**
 * @summary
 * Component for displaying and managing inventory batches.
 */
export class InventoryTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() batches: Batch[] = [];
  /** Feature flag for Experimento 04 (US-40): only the experimental group sees the rotation column. */
  @Input() rotationEnabled = false;

  @Output() edit = new EventEmitter<Batch>();
  @Output() delete = new EventEmitter<Batch>();
  @Output() create = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();

  /**
   * Data source for the inventory table.
   */
  dataSource = new MatTableDataSource<Batch>();

  /**
   * Columns to be displayed in the inventory table.
   * Adds "rotation" only when the experimental feature flag is on,
   * keeping the control group's table identical to the previous version.
   */
  get displayedColumns(): string[] {
    const columns = ['description', 'category', 'unit', 'expiration_date', 'stock', 'perishable'];
    if (this.rotationEnabled) columns.push('rotation');
    columns.push('actions');
    return columns;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private modalService: BaseModalService,
    private rotationAnalytics: RotationAnalyticsService) {}

  isMobile = false;
  private readonly viewportListener = () => this.checkViewport();

  /**
   * Initializes the component.
   * Sets up the filter predicate for the data source
   * to filter batches based on supply description or name.
   */
  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', this.viewportListener, {passive: true});
    this.dataSource.filterPredicate = (data: Batch, filter: string) => {
      const search = filter.trim().toLowerCase();
      const description= data.supply?.description?.toLowerCase() || '';
      const name = (data.supply as any)?.name?.toLowerCase() || '';
      return description.includes(search) || name.includes(search);
    }
  }

  /**
   * After view initialization, sets the paginator for the data source.
   * This allows the table to paginate through the batches.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.viewportListener);
  }

  /**
   * Handles changes to the input properties of the component.
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batches']) {
      this.dataSource.data = this.batches;
    }
    if (this.rotationEnabled && (changes['batches'] || changes['rotationEnabled'])) {
      this.rotationAnalytics.rotationColumnViewed(this.batches[0]?.user_id ?? 0, this.batches.length);
    }
  }

  onAddSupply() {
    this.add.emit();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isExpired(date?: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  checkViewport(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private rotationHoverStartMs = new Map<number, number>();

  onRotationHoverStart(supplyId: number): void {
    this.rotationHoverStartMs.set(supplyId, Date.now());
  }

  onRotationHoverEnd(supplyId: number, rotationLevel: string): void {
    const startedAt = this.rotationHoverStartMs.get(supplyId);
    if (startedAt == null) return;
    const dwellTimeMs = Date.now() - startedAt;
    this.rotationHoverStartMs.delete(supplyId);
    if (dwellTimeMs > 1000) {
      this.rotationAnalytics.rotationLevelHovered(supplyId, rotationLevel, dwellTimeMs);
    }
  }

  rotationBadgeClass(rotationLevel?: string): string {
    switch (rotationLevel) {
      case 'Alta': return 'rotation-high';
      case 'Media': return 'rotation-medium';
      case 'Baja': return 'rotation-low';
      default: return '';
    }
  }

  openDetails(batch: Batch): void {
    this.modalService.open({ title: batch.supply?.name || '', contentComponent: BatchDetailsComponent, width: '30rem', height: 'auto', initialData: batch });
  }
}
