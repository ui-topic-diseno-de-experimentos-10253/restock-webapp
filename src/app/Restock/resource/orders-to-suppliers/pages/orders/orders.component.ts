import { Component, ViewChild, OnInit, signal } from '@angular/core';
import { OrdersToolbarComponent } from '../../components/orders-toolbar/orders-toolbar.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { CreateOrdersModalComponent } from '../../components/create-orders-modal/create-orders-modal.component';
import { OrderToSupplierService } from '../../services/order-to-supplier.service';
import { OrderToSupplier } from '../../model/order-to-supplier.entity';
import { ProfileService } from '../../../../profiles/services/profile.service';
import { Profile } from '../../../../profiles/model/profile.entity';
import { UserService } from '../../../../iam/services/user.service';
import { OrderDetailsModalComponent } from '../../components/order-details/order-details-modal.component';
import { OrderFeedbackModalComponent } from '../../components/order-feedback-modal/order-feedback-modal.component';
import { SupplyService } from '../../../inventory/services/supply.service';
import { Supply } from '../../../inventory/model/supply.entity';
import { forkJoin } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../../../../../shared/services/session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  standalone: true,
  imports: [
    OrdersToolbarComponent,
    OrdersTableComponent,
    CreateOrdersModalComponent,
    OrderDetailsModalComponent,
    OrderFeedbackModalComponent,
    MatProgressSpinnerModule
  ],
})
export class OrdersComponent implements OnInit {
  orders: OrderToSupplier[] = [];
  filteredOrders: OrderToSupplier[] = [];
  providerProfiles: Profile[] = [];
  supplierOptions: { id: number; name: string }[] = [];
  searchTerm: string = '';
  selectedSupplierId: number | null = null;
  providerSupplies: Supply[] = [];
  isLoadingOrders = signal(false);
  isLoadingSuppliers = signal(false);
  isLoadingBatches = signal(false);

  @ViewChild(CreateOrdersModalComponent)
  createOrdersModalComponent!: CreateOrdersModalComponent;

  @ViewChild(OrderDetailsModalComponent) orderDetailsModal!: OrderDetailsModalComponent;
  selectedOrder!: OrderToSupplier;

  @ViewChild(OrderFeedbackModalComponent)
  orderFeedbackModal!: OrderFeedbackModalComponent;

  constructor(
    private orderService: OrderToSupplierService,
    private userService: UserService,
    private profileService: ProfileService,
    private supplyService: SupplyService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    // loadProviderProfiles fetches every supplier's full catalog (batches + custom
    // supplies) and is only needed for the Create Order modal / supplier name lookups.
    // It runs in the background so it never blocks the order list from rendering.
    this.loadProviderProfiles();
    await this.loadOrders();
  }

  async loadOrders() {
    this.isLoadingOrders.set(true);
    try {
      const adminRestaurantId = this.sessionService.getUserId();
      if (!adminRestaurantId) {
        this.orders = [];
        this.filteredOrders = [];
        return;
      }
      this.orders = await firstValueFrom(this.orderService.getByRestaurant(adminRestaurantId));
      this.filteredOrders = [...this.orders];
    } catch (error) {
      console.error('Error loading restaurant orders:', error);
      this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingOrders.set(false);
    }
  }
  //tester
  async loadProviderProfiles() {
    this.isLoadingSuppliers.set(true);
    this.isLoadingBatches.set(true);
    try {
      const providerUserIds = await this.userService.getSupplierUserIds(); // esto ya es un array de IDs
      if (!providerUserIds.length) {
        this.providerProfiles = [];
        this.supplierOptions = [];
        this.providerSupplies = [];
        return;
      }

      const enrichedSupplies = await this.supplyService.getSuppliesEnrichedByUserIds(providerUserIds);

      this.providerSupplies = enrichedSupplies.filter((supply: any) =>
        Array.isArray(supply.batches) &&
        supply.batches.some((batch: any) => batch.stock > 0)
      );

      // Build supplier options from available supplies so Create Order works
      // even when profile endpoints are unavailable.
      const supplierIds = Array.from(new Set(
        this.providerSupplies
          .map((s: any) => Number(s.user_id))
          .filter((id: number) => !Number.isNaN(id) && id > 0)
      ));

      this.supplierOptions = supplierIds.map(id => ({
        id,
        name: `Supplier ${id}`
      }));

      // Optional profile enrichment: if it fails, keep fallback names.
      try {
        const profileCalls$ = supplierIds.map(userId =>
          this.profileService.getByQuery('user_id', userId)
        );
        if (profileCalls$.length > 0) {
          const allResults = await firstValueFrom(forkJoin(profileCalls$));
          const profiles = allResults.flat();
          this.providerProfiles = profiles;

          const namesById = new Map<number, string>(
            profiles.map((profile: any) => [Number(profile.user_id ?? profile.userId ?? profile.id), profile.name])
          );
          this.supplierOptions = supplierIds.map(id => ({
            id,
            name: namesById.get(id) ?? `Supplier ${id}`
          }));
        } else {
          this.providerProfiles = [];
        }
      } catch (profileError) {
        console.warn('Profiles endpoint unavailable, using fallback supplier names.', profileError);
        this.providerProfiles = [];
      }

    } catch (error) {
      console.error('Error loading provider supplies:', error);
      this.snackBar.open('Error loading available supplies', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingSuppliers.set(false);
      this.isLoadingBatches.set(false);
    }
  }


  async onDeleteOrder(orderId: number): Promise<void> {
    try {
      this.isLoadingOrders.set(true);
      await firstValueFrom(this.orderService.deleteOrder(orderId));
      await this.loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      this.snackBar.open('Error deleting order', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingOrders.set(false);
    }
  }

  onOpenCreateOrderModal() {
    this.createOrdersModalComponent.openCreateOrderModal();
  }

  onSupplierFilterChanged(supplierId: number | null) {
    this.selectedSupplierId = supplierId;
    this.applyFilters();
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSupplier = this.selectedSupplierId === null || order.supplier_id === this.selectedSupplierId;

      const supplierName = this.getSupplierName(order.supplier_id).toLowerCase();
      const matchesSearch = supplierName.includes(this.searchTerm);

      return matchesSupplier && matchesSearch;
    });
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.supplierOptions.find(s => Number(s.id) === Number(supplierId));
    return supplier ? supplier.name : `Supplier ${supplierId}`;
  }
  openDetails(order: OrderToSupplier): void {
    this.selectedOrder = order;
    this.orderDetailsModal.open(order);
  }
  onOrderSelected(orderId: number): void {
    const selectedOrder = this.orders.find(order => order.id === orderId);
  }
  openFeedback(order: OrderToSupplier): void {
    this.selectedOrder = order;
    this.orderFeedbackModal.open(order);
  }
}
