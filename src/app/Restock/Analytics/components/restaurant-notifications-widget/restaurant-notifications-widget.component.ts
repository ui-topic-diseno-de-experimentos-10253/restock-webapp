import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {
  AlertNotification,
  RestaurantNotificationsService
} from '../../../resource/inventory/services/restaurant-notifications.service.service';

@Component({
  selector: 'app-restaurant-notifications-widget',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, TranslateModule],
  templateUrl: './restaurant-notifications-widget.component.html',
  styleUrl: './restaurant-notifications-widget.component.css'
})
export class RestaurantNotificationsWidgetComponent implements OnInit {
  private readonly notificationsService = inject(RestaurantNotificationsService);

  inventoryAlerts: AlertNotification[] = [];
  orderAlerts: AlertNotification[] = [];
  isLoading = true;
  hasError = false;

  async ngOnInit(): Promise<void> {
    try {
      const summary = await this.notificationsService.loadSummary();
      this.inventoryAlerts = summary.inventory;
      this.orderAlerts = summary.orders;
    } catch (error) {
      console.error('Error loading summary notifications:', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  iconFor(tone: AlertNotification['tone']): string {
    const icons: Record<AlertNotification['tone'], string> = {
      danger: 'warning_amber',
      warning: 'inventory_2',
      success: 'check_circle',
      info: 'update'
    };
    return icons[tone];
  }
}
