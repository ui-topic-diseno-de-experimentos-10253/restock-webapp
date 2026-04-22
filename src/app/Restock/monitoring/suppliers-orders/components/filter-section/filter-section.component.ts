import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';


export interface DateRangeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-section',
  imports: [CommonModule,
    FormsModule, MatFormFieldModule, MatIcon, MatSelectModule, MatInput, MatButton, MatIconButton, TranslatePipe],
  templateUrl: './filter-section.component.html',
  styleUrl: './filter-section.component.css'
})


export class FilterSectionComponent {
  @Input() title: string = 'Orders';
  @Input() searchQuery: string = '';
  @Input() selectedDateRange: string = '';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() sortOrder: number = 1;
  @Input() sortLabel: string = 'Order Date';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedDateRangeChange = new EventEmitter<string>();
  @Output() toggleSort = new EventEmitter<void>();

  constructor( private translate: TranslateService) {}

  dateRangeOptions: DateRangeOption[] = [
    { label: this.translate.instant('supplier-orders.filters.last-7days'), value: '7days' },
    { label: this.translate.instant('supplier-orders.filters.last-30days'), value: '30days' },
    { label: this.translate.instant('supplier-orders.filters.last-3months'), value: '3months' }
  ];

  onSearchChange(value: string): void {
    this.searchQueryChange.emit(value);
  }

  onDateRangeChange(value: string): void {
    this.selectedDateRangeChange.emit(value);
  }

  onToggleSort(): void {
    this.toggleSort.emit();
  }

  getSortIcon(): string {
    return this.sortOrder === 1 ? 'arrow_upward' : 'arrow_downward';
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onSearchChange(input.value);
  }

  // Method to clear the date input
  clearDateRange(): void {
    this.onDateRangeChange('');
  }


}
