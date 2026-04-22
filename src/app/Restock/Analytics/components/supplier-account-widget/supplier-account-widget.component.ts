import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';
import {NgIf, NgFor, DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {OrderToSupplierService} from '../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import {OrderToSupplier} from '../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
// import { DatePickerModule } from 'primeng/datepicker';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
// import { ChartModule } from 'primeng/chart';
import { MatDialog } from '@angular/material/dialog';
import { SupplierCalendarDialogComponent} from '../supplier-calendar-dialog.component';

@Component({
  selector: 'app-supplier-account-widget',
  standalone: true,
  imports: [
    NgFor,
    MatIcon,
    MatTabsModule,
    MatFormField,
    MatSelectModule,
    FormsModule,
    MatNativeDateModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    // ChartModule,
    MatIconButton,
    MatButton,
    // DatePickerModule
  ],
  templateUrl: './supplier-account-widget.component.html',
  styleUrl: './supplier-account-widget.component.css',
  providers: [DatePipe],
})
export class SupplierAccountWidgetComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderToSupplierService);
  orders = signal<OrderToSupplier[]>([]);
  dialog = inject(MatDialog);

  selectedTabIndex = 0;
  selectedRange: string = 'week';
  predefinedRanges = [
    {label: 'Today', value: 'today'},
    {label: 'Week', value: 'week'},
    {label: 'Month', value: 'month'},
    {label: 'Year', value: 'year'},
  ];

  rangeDates: Date[] | null = null;

  // Filters
  from: Date = new Date(new Date().setDate(new Date().getDate() - 6));
  to: Date = new Date();
  supplierId = 1;

  // Chart
  pChartData: any;
  pChartOptions: any;

  // Device
  isMobile = false;

  onTabChange(index: number): void {
    this.selectedTabIndex = index;

    if (index === 2) {
      this.onDateChange();
    }
  }

  async ngOnInit(): Promise<void> {
    this.checkViewport();
    window.addEventListener('resize', this.checkViewport.bind(this));
    await this.loadOrders();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkViewport.bind(this));
  }

  checkViewport(): void {
    this.isMobile = window.innerWidth <= 800;
  }

  async loadOrders(): Promise<void> {
    const enriched = await this.orderService.getAllEnriched();
    this.orders.set(enriched);
    this.selectPredefinedRange(this.selectedRange);
  }

  selectPredefinedRange(value: string): void {
    this.selectedRange = value;
    this.rangeDates = null;

    const today = new Date();
    switch (value) {
      case 'today':
        this.from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        this.from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        this.to = today;
        break;
      case 'month':
        this.from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        this.to = today;
        break;
      case 'year':
        this.from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        this.to = today;
        break;
    }

    this.onDateChange();
  }

  onCalendarRangeChange(): void {
    if (this.rangeDates && this.rangeDates.length === 2) {
      const [from, to] = this.rangeDates;
      this.from = from;
      this.to = to;
      this.onDateChange();
    }
  }

  onDateChange(): void {
    this.initPrimeNGChart();
  }

  get filteredOrders(): OrderToSupplier[] {
    return this.orders().filter(order =>
      order.supplier_id === this.supplierId &&
      !!order.date &&
      order.date >= this.from &&
      order.date <= this.to &&
      (order.state?.name === 'Delivered' || order.state?.name === 'Paid')
    );
  }

  get filteredEarnings(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  }

  get filteredSupplies(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.requested_products_count, 0);
  }

  initPrimeNGChart(): void {
    const range = this.selectedRange;
    const dataMap = new Map<string, number>();
    const labels: string[] = [];
    const data: number[] = [];

    const formatKey = (date: Date): string => {
      if (range === 'custom') {
        return date.toLocaleDateString('en-GB');
      }
      switch (range) {
        case 'today': return date.getHours().toString().padStart(2, '0') + ':00';
        case 'week': return date.toLocaleDateString('en-US', {weekday: 'short'});
        case 'month': return `Week ${Math.ceil(date.getDate() / 7)}`;
        case 'year': return date.toLocaleDateString('en-US', {month: 'short'});
        default:
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    };

    this.filteredOrders.forEach(order => {
      if (!order.date) return;
      const date = new Date(order.date);
      const key = formatKey(date);
      const current = dataMap.get(key) || 0;
      dataMap.set(key, current + order.totalPrice);
    });

    if (range === 'custom') {
      const current = new Date(this.from);
      while (current <= this.to) {
        const key = current.toLocaleDateString('en-GB');
        labels.push(key);
        data.push(dataMap.get(key) || 0);
        current.setDate(current.getDate() + 1);
      }
    } else if (range === 'today') {
      for (let h = 0; h < 24; h++) {
        const hour = h.toString().padStart(2, '0') + ':00';
        labels.push(hour);
        data.push(dataMap.get(hour) || 0);
      }
    } else if (range === 'week') {
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
        labels.push(day);
        data.push(dataMap.get(day) || 0);
      });
    } else if (range === 'month') {
      ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].forEach(week => {
        labels.push(week);
        data.push(dataMap.get(week) || 0);
      });
    } else if (range === 'year') {
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach(month => {
        labels.push(month);
        data.push(dataMap.get(month) || 0);
      });
    } else {
      const start = new Date(this.from.getFullYear(), this.from.getMonth(), 1);
      const end = new Date(this.to.getFullYear(), this.to.getMonth(), 1);
      const current = new Date(start);
      while (current <= end) {
        const key = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
        const label = current.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
        labels.push(label);
        data.push(dataMap.get(key) || 0);
        current.setMonth(current.getMonth() + 1);
      }
    }

    const maxY = Math.max(...data, 0);
    const stepSize = maxY > 1000 ? 500 : maxY > 200 ? 100 : maxY > 50 ? 20 : 5;

    this.pChartData = {
      labels,
      datasets: [
        {
          label: 'Earnings',
          data,
          fill: true,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66,165,245,0.2)',
          tension: 0,
        },
      ],
    };

    this.pChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#495057' } },
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#495057', stepSize },
          grid: { color: '#ebedef' },
        },
      },
    };
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

  }

  openCalendarDialog(): void {
    const dialogRef = this.dialog.open(SupplierCalendarDialogComponent, {
      width: '300px',
      data: { selectedRange: this.rangeDates }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && Array.isArray(result) && result.length === 2) {
        this.rangeDates = result;
        [this.from, this.to] = result;
        this.selectedRange = 'custom';
        this.onDateChange();
      }
    });
  }
}
