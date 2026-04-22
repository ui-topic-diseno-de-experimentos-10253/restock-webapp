import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CurrencyPipe, DatePipe, NgIf} from "@angular/common";
import {FilterSectionComponent} from "../filter-section/filter-section.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTableModule
} from "@angular/material/table";
import {MatPaginator} from '@angular/material/paginator';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {OrderToSupplier} from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {EmptySectionComponent} from '../../../../../shared/components/empty-section/empty-section.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-approved-orders',
  imports: [
    CurrencyPipe,
    FilterSectionComponent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTableModule,
    MatIconButton,
    DatePipe,
    EmptySectionComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgIf,
    TranslatePipe
  ],
  templateUrl: './approved-orders.component.html',
  styleUrl: './approved-orders.component.css'
})
export class ApprovedOrdersComponent {
  @Input() orders: Array<OrderToSupplier> = [];
  @Input() adminRestaurantsProfiles: { [orderId: number]: string } = {};

  @Output() deleteDialog = new EventEmitter<OrderToSupplier>();
  @Output() detailsModal = new EventEmitter<OrderToSupplier>();
  @Output() editModal = new EventEmitter<OrderToSupplier>();

  displayedColumns: string[] = ['orderDate', 'state', 'shipDate', 'restaurantName', 'requestedProducts', 'finalPrice', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  openOrderDetails(order: OrderToSupplier): void {
    this.detailsModal.emit(order);
  }

  openDeleteDialog(order: any): void {
    this.deleteDialog.emit(order);
  }

  openEditOrder(order: any): void  {
    this.editModal.emit(order);
  }

  // Method to get CSS class according to the order state
  getRowClass(order: OrderToSupplier): string {
    if (!order.state || !order.state.name) return '';

    switch (order.state.name.toLowerCase()) {
      case 'on hold':
        return 'row-on-hold';
      case 'on the way':
        return 'row-on-the-way';
      case 'delivered':
        return 'row-delivered';
      case 'preparing':
        return 'row-preparing';
      default:
        return '';
    }
  }

  searchTerm: string = '';
  dateRange: string = '';
  currentSortOrder: number = 1;
  selectedState: number = 0;

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  onDateRangeChange(value: string): void {
    this.dateRange = value;
  }

  onToggleSort(): void {
    this.currentSortOrder = this.currentSortOrder === 1 ? -1 : 1;
  }

  get filteredOrders(): OrderToSupplier[] {
    let filtered = [...this.orders];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(order =>
        order.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.adminRestaurantsProfiles[order.id]?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrar por rango de fechas (ejemplo simple)
    if (this.dateRange === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(order => order.date && new Date(order.date) >= sevenDaysAgo);
    } else if (this.dateRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(order => order.date && new Date(order.date) >= thirtyDaysAgo);
    } else if (this.dateRange === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = filtered.filter(order => order.date && new Date(order.date) >= threeMonthsAgo);
    }

    // Filtrar por estado seleccionado
    if (this.selectedState > 0) {
      filtered = filtered.filter(order => order.order_to_supplier_state_id === this.selectedState);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const dateA = a.date?.getTime() || 0;
      const dateB = b.date?.getTime() || 0;
      return this.currentSortOrder * (dateA - dateB);
    });

    return filtered;
  }

  clearStateFilter(): void {
    this.selectedState = 0;
  }


}
