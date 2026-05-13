import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { OrderToSupplierService} from '../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import { ProfileService} from '../../../profiles/services/profile.service';
import { UserService} from '../../../iam/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-supplier-frequent-customers-widget',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass],
  templateUrl: './supplier-frequent-customers-widget.component.html',
  styleUrl: './supplier-frequent-customers-widget.component.css'
})
export class SupplierFrequentCustomersWidgetComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderToSupplierService);
  private readonly profileService = inject(ProfileService);
  private readonly userService = inject(UserService);

  customers: { name: string; category: string; description: string; count: number }[] = [];
  isMobile = false;
  supplierId = 1; // Se reemplazará cuando se conecte a auth

  async ngOnInit() {
    this.checkViewport();
    window.addEventListener('resize', this.checkViewport.bind(this));
    await this.loadCustomers();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkViewport.bind(this));
  }

  checkViewport(): void {
    this.isMobile = window.innerWidth <= 800;
  }

  async loadCustomers() {
    const orders = await this.orderService.getAllOrders();
    const filteredOrders = orders.filter(o => o.supplier_id === this.supplierId);

    const frequencyMap = new Map<number, number>();
    for (const order of filteredOrders) {
      const userId = order.admin_restaurant_id;
      frequencyMap.set(userId, (frequencyMap.get(userId) ?? 0) + 1);
    }

    const sortedEntries = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const users = await this.userService.getAllEnriched();

    this.customers = await Promise.all(
      sortedEntries.map(async ([userIdStr, count]) => {
        const userId = Number(userIdStr);
        const user = users.find(u => u.id === userId);
        const profiles = await firstValueFrom(this.profileService.getByQuery("user_id", userId));
        const profile = profiles[0] ?? null;

        return {
          name: profile?.business?.name || user?.email || 'Unknown',
          category: profile?.business?.categories || 'No category',
          description: `Has placed ${count} order${count > 1 ? 's' : ''} in total.`,
          count
        };
      })
    );
  }

  getPairs() {
    const pairs = [];
    for (let i = 0; i < this.customers.length; i += 2) {
      pairs.push(this.customers.slice(i, i + 2));
    }
    return pairs;
  }
}
