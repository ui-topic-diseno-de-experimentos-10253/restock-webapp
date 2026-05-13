import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FilterSectionComponent } from "../filter-section/filter-section.component";
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { OrderToSupplier } from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import { EmptySectionComponent } from '../../../../../shared/components/empty-section/empty-section.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-delivered-orders',
  imports: [
    CurrencyPipe,
    FilterSectionComponent,
    MatIcon,
    MatPaginator,
    MatTableModule,
    MatIconButton,
    DatePipe,
    EmptySectionComponent,
    MatButton,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './delivered-orders.component.html',
  styleUrl: './delivered-orders.component.css'
})
export class DeliveredOrdersComponent {
  @Input() orders: Array<OrderToSupplier> = [];
  @Input() adminRestaurantsProfiles: { [orderId: number]: string } = {};

  @Output() detailsModal = new EventEmitter<OrderToSupplier>();

  displayedColumns: string[] = ['orderDate', 'shipDate', 'restaurantName', 'requestedProducts', 'finalPrice', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  openOrderDetails(order: OrderToSupplier) {
    this.detailsModal.emit(order);
  }

  // Method to get CSS class according to the order state
  getRowClass(order: OrderToSupplier): string {
    if (!order.state || !order.state.name) return '';

    if (order.state.name.toLowerCase() == 'delivered')
      return 'row-delivered';
    else
      return '';
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

  exportOrders(): void {
    const ordersToExport = this.filteredOrders;

    const exportData = ordersToExport.map(order => ({
      'Order Date': order.date ?? '',
      'Ship Date': order.estimated_ship_date ?? '',
      'Restaurant': this.adminRestaurantsProfiles[order.id] ?? '',
      'Description': order.description ?? '',
      'Total Price': order.totalPrice ?? ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Orders': worksheet },
      SheetNames: ['Orders']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    FileSaver.saveAs(blob, 'orders-report.xlsx');
  }
}
