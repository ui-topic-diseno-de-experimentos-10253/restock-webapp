import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import { forkJoin, lastValueFrom } from 'rxjs';
import {OrderToSupplierService} from '../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import {
  OrdersTableComponent
} from '../../../resource/orders-to-suppliers/components/orders-table/orders-table.component';
import {OrderToSupplier} from '../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {UserService} from '../../../iam/services/user.service';
import {ProfileService} from '../../../profiles/services/profile.service';
import {Profile} from '../../../profiles/model/profile.entity';

@Component({
  selector: 'app-restaurant-pending-orders-widget',
  standalone: true,
  imports: [CommonModule, OrdersTableComponent, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './restaurant-pending-orders-widget.component.html',
  styleUrl: './restaurant-pending-orders-widget.component.css'
})
export class RestaurantPendingOrdersWidgetComponent implements OnInit {
  pendingOrders: OrderToSupplier[] = [];
  suppliers: { id: number; name: string }[] = [];

  constructor(
    private orderService: OrderToSupplierService,
    private router: Router,
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    const orders = await this.orderService.getAllEnriched();

    this.pendingOrders = orders.filter(
      (o) => o.situation?.name?.toLowerCase() === 'pending'
    );

    const supplierUserIds = await this.userService.getSupplierUserIds();

    const profileObservables = supplierUserIds.map(id =>
      this.profileService.getByQuery('user_id', id)
    );

    const allProfilesNested = await lastValueFrom(forkJoin(profileObservables));
    const allProfiles = allProfilesNested.flat();

    this.suppliers = allProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name
    }));
  }

  goToOrders(): void {
    this.router.navigate(['/dashboard/restaurant/orders']);
  }
}
