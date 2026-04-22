import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {NewOrdersComponent} from '../../components/new-orders/new-orders.component';
import {ApprovedOrdersComponent} from '../../components/approved-orders/approved-orders.component';
import {DeliveredOrdersComponent} from '../../components/delivered-orders/delivered-orders.component';
import {OrderToSupplier} from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {Profile} from '../../../../profiles/model/profile.entity';
import {Supply} from '../../../../resource/inventory/model/supply.entity';
import {OrderToSupplierService} from '../../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import {BatchService} from '../../../../resource/inventory/services/batch.service';
import {UserService} from '../../../../iam/services/user.service';
import {ProfileService} from '../../../../profiles/services/profile.service';
import {OrderToSupplierBatch} from '../../../../resource/orders-to-suppliers/model/order-to-supplier-batch.entity';
import {
  OrderToSupplierBatchService
} from '../../../../resource/orders-to-suppliers/services/order-to-supplier-batch.service';
import {DeleteComponent} from '../../../../../shared/components/delete/delete.component';
import {BaseModalService} from '../../../../../shared/services/base-modal.service';
import {firstValueFrom} from 'rxjs';
import {OrderToSupplierState} from '../../../../resource/orders-to-suppliers/model/order-to-supplier-state.entity';
import {
  OrderToSupplierSituation
} from '../../../../resource/orders-to-suppliers/model/order-to-supplier-situation.entity';
import {ManageNewOrdersComponent} from '../../components/manage-new-orders/manage-new-orders.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {OrderDetailsComponent} from '../../components/order-details/order-details.component';
import {EditOrderComponent} from '../../components/edit-order/edit-order.component';
import {OrderStateService} from '../../../../resource/orders-to-suppliers/services/order-to-supplier-state.service';
import {Batch} from '../../../../resource/inventory/model/batch.entity';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-suppliers-orders-overview',
  imports: [
    MatTabsModule,
    NewOrdersComponent,
    ApprovedOrdersComponent,
    DeliveredOrdersComponent,
    TranslatePipe
  ],
  templateUrl: './suppliers-orders-overview.component.html',
  styleUrl: './suppliers-orders-overview.component.css'
})
export class SuppliersOrdersOverviewComponent implements OnInit {
  orders: Array<OrderToSupplier> = [];
  readonly adminRestaurantsProfiles: Profile[] = [];

  restaurantNameMap: { [orderId: number]: string } = {};
  detailedSuppliesGroupedByOrder: { orderId: number; supplies: Supply[] }[] = [];
  detailedSBatchesGroupedByOrder: { orderId: number; batches: Batch[] }[] = [];
  batchesGroupedByOrder: { orderId: number; batches: OrderToSupplierBatch[] }[] = [];
  deliveredOrders: Array<OrderToSupplier> = [];
  ordersInProcess: Array<OrderToSupplier> = [];
  newOrders: Array<OrderToSupplier> = [];

  @ViewChild(DeleteComponent) orderDeclineModal!: DeleteComponent;

  selectedOrder: OrderToSupplier | null = null;
  detailedSuppliesPerOrder: Supply[] = [];
  batchesPerOrder: OrderToSupplierBatch[] = [];
  restaurantNameOrderSelected: string = '';
  states: OrderToSupplierState[] = [];

  constructor(
    private orderService: OrderToSupplierService,
    private orderToSupplierBatchService: OrderToSupplierBatchService,
    private batchService: BatchService,
    private userService: UserService,
    private profileService: ProfileService,
    private stateService: OrderStateService,
    private modalService: BaseModalService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    await this.loadOrders();
    await this.loadGroupedSupplies();
    await this.loadUsersAndProfiles();
    await this.loadStates();
  }

  buildRestaurantNameMap() {
    this.restaurantNameMap = {};

    this.orders.forEach(order => {
      const profile = this.adminRestaurantsProfiles.find(p => Number(p.id) === Number(order.admin_restaurant_id));
      this.restaurantNameMap[order.id] = profile?.business?.name ?? 'Unknown Restaurant';
    });
  }

  async loadStates() {
    try {
      this.states = await this.stateService.getAllStates();
      console.log('States loaded:', this.states);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  }

  async loadOrders() {
    this.orders = await this.orderService.getAllEnriched();
    console.log('Orders loaded:', this.orders);

    // Filter delivered orders
    this.deliveredOrders = this.orders.filter(order =>
      order.state?.name.toLowerCase() === 'delivered'
    );

    // Filter orders in process: situation = approved && state != delivered
    this.ordersInProcess = this.orders.filter(order =>
      order.situation?.name.toLowerCase() === 'approved' &&
      order.state?.name.toLowerCase() !== 'delivered'
    );

    this.newOrders = this.orders.filter(order =>
      order.situation?.name.toLowerCase() === 'pending'
    );

    console.log('Delivered Orders:', this.deliveredOrders);
    console.log('Orders In Process:', this.ordersInProcess);
  }
  async loadUsersAndProfiles() {
    const restaurantUsersId = await this.userService.getRestaurantAdminUserIds();

    this.profileService.loadProfilesByUserIds(restaurantUsersId).subscribe((profiles) => {
      this.adminRestaurantsProfiles.splice(0, this.adminRestaurantsProfiles.length, ...profiles);
      console.log('Loaded restaurant profiles:', this.adminRestaurantsProfiles);

      this.buildRestaurantNameMap();
    });
  }


  async loadGroupedSupplies() {
    try {
      const batches = await this.batchService.getAllBatchesWithSupplies();

      const result = await Promise.all(
        this.orders.map(async (order) => {
          const orderBatches = order.orderBatches || await this.orderToSupplierBatchService.getSupplyByOrder(order.id);

          // supplyGroupedByOrder: original list
          const supplyGroup = {
            orderId: order.id,
            batches: orderBatches,
          };

          // detailedSBatchesGroupedByOrder: list with batches of each order
          const detailedBatchesGroup = {
            orderId: order.id,
            batches: orderBatches
              .map(ob => {
                const batch = ob.batch;
                return batch ? batch : null;
              })
              .filter((b): b is Batch => b !== null),
          }

          // detailedSuppliesGroupedByOrder: list with detailed supply information of each batch
          const detailedGroup = {
            orderId: order.id,
            supplies: orderBatches
              .map(ob => {
                const batch = ob.batch;
                return batch ? batch.supply : null;
              })
              .filter((s): s is Supply => s !== null),
          };

          return { supplyGroup, detailedBatchesGroup, detailedGroup };
        })
      );

      // Map the results to the component properties
      this.batchesGroupedByOrder = result.map(r => r.supplyGroup);
      this.detailedSuppliesGroupedByOrder = result.map(r => r.detailedGroup);
      this.detailedSBatchesGroupedByOrder = result.map(r => r.detailedBatchesGroup);

      console.log('Batches grouped by order:', this.detailedSBatchesGroupedByOrder);
      console.log('Supplies grouped:', this.batchesGroupedByOrder);
      console.log('Detailed supplies grouped:', this.detailedSuppliesGroupedByOrder);

    } catch (error) {
      console.error('Error loading grouped supplies:', error);
    }
  }

  //MODALS METHODS

  openOrderDetailsModal(order: OrderToSupplier,  hideState: boolean): void {
    this.selectedOrder = order;
    this.detailedSuppliesPerOrder = this.getDetailedOrderSupplies(order.id);

    if(hideState) // true = details of new order
    {
      this.batchesPerOrder = this.getOrderBatches(order.id);
    }
    else // false = details of approved order
    {
      this.batchesPerOrder = this.getOrderBatches(order.id).filter(batchOrder => batchOrder?.accepted === true);
    }

    this.restaurantNameOrderSelected = this.restaurantNameMap[order.id] || '';

    this.modalService.open({
      title: this.translate.instant('supplier-orders.details.title'),
      contentComponent: OrderDetailsComponent,
      description:  this.translate.instant('supplier-orders.details.description'),
      width: '40vw',
      height: '85vh',
      initialData: {
        order: order,
        suppliesDetailsOfOrder: this.detailedSuppliesPerOrder,
        batchesOfOrder: this.batchesPerOrder,
        adminRestaurantName: this.restaurantNameOrderSelected,
        hideState: hideState
      }
    }).afterClosed().subscribe(async (confirmed: boolean) => {

    });

  }

  openDeleteOrderDialog(order: OrderToSupplier, action: string): void {
    let titleContent = '';
    let newIdSituation = 0; // Default situation ID

    if(action === 'decline')
    {
      titleContent = 'Decline Order';
      newIdSituation = 3; // ID of "Declined"
    }
    else
    {
      titleContent = 'Cancel Order';
      newIdSituation = 4; // ID of "Cancelled"
    }

    this.modalService.open({
      title: titleContent,
      contentComponent: DeleteComponent,
      width: '25rem',
      label: action + ' this order',
    }).afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        try {
          const updatedOrder: OrderToSupplier = {
            id: order.id,
            date: order.date,
            description: order.description,
            estimated_ship_date: order.estimated_ship_date,
            estimated_ship_time: order.estimated_ship_time,
            admin_restaurant_id: order.admin_restaurant_id,
            supplier_id: order.supplier_id,
            order_to_supplier_state_id: 1, // ID of "On Hold"
            order_to_supplier_situation_id: newIdSituation, // ID of "Declined"
            requested_products_count: order.requested_products_count,
            totalPrice: order.totalPrice,
            partially_accepted: order.partially_accepted
          };

          await firstValueFrom(this.orderService.update(order.id, updatedOrder));

          if(action === 'cancel')
          {
            const acceptedBatches = order.orderBatches?.filter(ob => ob.accepted === true) || [];

            acceptedBatches?.forEach((orderBatch) => {
              const batch = orderBatch.batch;
              if (batch) {
                batch.stock += orderBatch.quantity; // Restore stock
                this.batchService.update(batch.id, batch);
              }
            });
          }

          // Reload all data to ensure UI consistency
          await this.loadOrders();
          await this.loadGroupedSupplies();

          console.log('Order updated successfully');
        } catch (error) {
          console.error('Error updating order situation to Declined:', error);
        }
      }
    });
  }

  getDetailedOrderSupplies(orderId: number): Supply[] {
    const orderGroup = this.detailedSuppliesGroupedByOrder.find(group =>
      Number(group.orderId) === Number(orderId)
    );
    return orderGroup ? orderGroup.supplies : [];
  }

  getOrderBatches(orderId: number) {
    const orderGroup = this.batchesGroupedByOrder.find(group =>
      Number(group.orderId) === Number(orderId)
    );
    console.log('Batches for order ID', orderId, ':', orderGroup?.batches);
    return orderGroup ? orderGroup.batches : [];

  }

  openManageOrderModal(order: OrderToSupplier): void {
    this.detailedSuppliesPerOrder = this.getDetailedOrderSupplies(order.id);
    this.batchesPerOrder = this.getOrderBatches(order.id);
    this.selectedOrder = order;
    this.restaurantNameOrderSelected = this.restaurantNameMap[order.id] || '';

    const dialogRef = this.modalService.open({
      title: this.translate.instant('supplier-orders.manage-new-orders.title'),
      contentComponent: ManageNewOrdersComponent,
      width: '40vw',
      height: '90vh',
      description: this.translate.instant('supplier-orders.manage-new-orders.description'),
      initialData: {
        order: order,
        suppliesDetailsOfOrder: this.detailedSuppliesPerOrder,
        batchesDetailsOfOrder: this.detailedSBatchesGroupedByOrder,
        batchesOfOrder: this.batchesPerOrder,
        adminRestaurantName: this.restaurantNameOrderSelected
      }
    });

    setTimeout(() => {
      const instance = dialogRef.componentInstance
        .contentComponentRef?.instance as ManageNewOrdersComponent;

      instance?.acceptSelection.subscribe((order) => {
        try {
          order.orderBatches?.forEach(orderBatch => (orderBatch.accepted = true));

          order.state =  this.states.find(state => state.id === order.order_to_supplier_state_id);
          order.situation = new OrderToSupplierSituation({ id: 2, name: 'Approved' });

          // Filter out null/undefined batches and update stock
          const validBatches = order.orderBatches
            ?.map(orderBatch => {
              const batch = orderBatch?.batch;
              if (batch) {
                batch.stock -= orderBatch.quantity;
                return batch;
              }
              return null;
            })
            .filter(batch => batch !== null); // Remove null/undefined entries

          this.orderService.updateOrder(order.id, order);

          order.orderBatches?.forEach(orderBatch => {
            this.orderToSupplierBatchService.updateSupply(orderBatch.id, orderBatch);
          })


          // Now safely update only valid batches
          validBatches?.forEach((batch) => {
            this.batchService.update(batch.id, batch);
          });

          this.snackBar.open('Order updated successfully', 'Close', { duration: 3000 });
          dialogRef.close();
           this.loadOrders();
           this.loadGroupedSupplies();
        } catch (error) {
          console.error('Error updating order:', error);
          this.snackBar.open('Failed to update order', 'Close', { duration: 3000 });
        }
      });
    });

  }

  openEditOrderModal(order: OrderToSupplier): void {

    const dialogRef = this.modalService.open({
      title: this.translate.instant('supplier-orders.update-order.title'),
      contentComponent: EditOrderComponent,
      width: '40vw',
      height: '90vh',
      description: this.translate.instant('supplier-orders.update-order.description'),
      initialData: {
        order: order
      }
    });

    setTimeout(() => {
      const instance = dialogRef.componentInstance
        .contentComponentRef?.instance as EditOrderComponent;

      instance?.updateOrder.subscribe((order) => {
        try {
          // Update state
          order.state = this.states.find(state => state.id === order.order_to_supplier_state_id);

          this.orderService.updateOrder(order.id, order);

          this.snackBar.open('Order updated successfully', 'Close', { duration: 3000 });
          dialogRef.close();
          this.loadOrders();
        } catch (error) {
          console.error('Error updating order:', error);
          this.snackBar.open('Failed to update order', 'Close', { duration: 3000 });
        }
      });
    });

  }

}

