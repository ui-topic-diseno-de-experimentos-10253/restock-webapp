import {Component, OnInit, inject} from '@angular/core';
import {
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
  MatCellDef, MatCell, MatRow, MatHeaderRowDef,
  MatHeaderRow, MatRowDef
} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {NgClass, CommonModule} from '@angular/common';
import {RestaurantNotificationsService} from '../../../resource/inventory/services/restaurant-notifications.service.service';
import {AlertNotification} from '../../../resource/inventory/services/restaurant-notifications.service.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-restaurant-notifications-widget',
  standalone: true,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatButton,
    MatRow,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatTabsModule,
    NgClass,
    CommonModule
  ],
  templateUrl: './restaurant-notifications-widget.component.html',
  styleUrl: './restaurant-notifications-widget.component.css'
})
export class RestaurantNotificationsWidgetComponent implements OnInit {
  private readonly notificationsService = inject(RestaurantNotificationsService);

  displayedColumns: string[] = ['ingredient', 'status'];

  inventoryAlerts: AlertNotification[] = [];
  orderAlerts: AlertNotification[] = [];

  ngOnInit(): void {
    this.notificationsService.getInventoryAlerts().subscribe({
      next: (data) => this.inventoryAlerts = data//.slice(0, 3)
    });

    this.notificationsService.getOrderAlerts().subscribe({
      next: (data) => this.orderAlerts = data//.slice(0, 3)
    });
  }
}
