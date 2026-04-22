import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
@Component({
  selector: 'orders-toolbar',
  templateUrl: './orders-toolbar.component.html',
  styleUrls: ['./orders-toolbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    TranslatePipe
  ],
})
export class OrdersToolbarComponent {
  @Output() createOrder = new EventEmitter<void>();
  @Output() supplierFilterChanged = new EventEmitter<number | null>();
  @Output() searchChanged = new EventEmitter<string>();

  @Input() suppliers: { id: number; name: string }[] = [];

  searchControl = new FormControl('');
  selectedSupply: number | null = null;
  selectedSupplierFilter: number | null = null;
  constructor() {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchChanged.emit(value?.trim().toLowerCase() ?? '');
    });
  }
  supplies = [
    { id: 1, name: 'Arroz' },
    { id: 2, name: 'Papa' }
  ];


  onCreateOrder(): void {
    this.createOrder.emit();
  }

  onSupplierChange(value: number | null): void {
    this.selectedSupplierFilter = value;
    this.supplierFilterChanged.emit(value);
  }
}
