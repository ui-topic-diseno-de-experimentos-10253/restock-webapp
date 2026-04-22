// manage-new-orders.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Optional,
  Inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';
import { MatList, MatListModule } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {OrderToSupplier} from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {OrderToSupplierService} from '../../../../resource/orders-to-suppliers/services/order-to-supplier.service';
import {Supply} from '../../../../resource/inventory/model/supply.entity';
import {OrderToSupplierBatch} from '../../../../resource/orders-to-suppliers/model/order-to-supplier-batch.entity';
import {Batch} from '../../../../resource/inventory/model/batch.entity';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  selector: 'app-manage-new-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatStepperModule,
    FormsModule,
    MatListModule,
    MatIcon,
    MatPaginator,
    MatDialogActions,
    MatDialogContent,
    TranslatePipe
  ],
  templateUrl: './manage-new-orders.component.html',
  styleUrl: './manage-new-orders.component.css'
})
export class ManageNewOrdersComponent implements OnInit {

  localOrder = {
    description: '',
    estimatedShipDate: null,
    estimatedShipTime: null,
  };

  dataSource = new MatTableDataSource<OrderToSupplierBatch>();
  step = 1;
  selection = new SelectionModel<number>(true, []);

  displayedColumns: string[] = ['productName', 'quantity', 'unitMeasure', 'select'];

  // Input data from the modal with injected data
  order: OrderToSupplier | null = null;
  adminRestaurantName: string = '';
  suppliesDetailsOfOrder: Array<Supply> = [];
  batchesDetailsOfOrder: Array<Batch> = [];
  batchesOfOrder: Array<OrderToSupplierBatch> = [];

  @Output() acceptSelection = new EventEmitter<OrderToSupplier>();

  // Cache para los batches actuales (para validación de stock)
  private batchesCache: Map<number, Batch> = new Map();


  constructor(
    private snackBar: MatSnackBar,
    @Optional() @Inject('initialData') private injectedData?: any,
    @Optional() private dialogRef?: MatDialogRef<ManageNewOrdersComponent>
  ) {}

  ngOnInit(): void {

    if (this.injectedData) {
      console.log('Datos inyectados:', this.injectedData);

      this.order = this.injectedData.order || null;
      this.adminRestaurantName = this.injectedData.adminRestaurantName || '';
      this.suppliesDetailsOfOrder = this.injectedData.suppliesDetailsOfOrder || [];
      this.batchesDetailsOfOrder = this.injectedData.batchesDetailsOfOrder || [];
      this.batchesOfOrder = this.injectedData.batchesOfOrder || [];
    }

    console.log('Datos finales:', {
      order: this.order,
      supplies: this.suppliesDetailsOfOrder,
      batches: this.batchesOfOrder,
      restaurantName: this.adminRestaurantName
    });

    this.dataSource.data = this.batchesOfOrder;
  }

  onAcceptSelection(): void
  {
    if (this.selection.selected.length <= 0) {
      this.snackBar.open('Please select at least one supply to approve the order', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const updateData = this.buildUpdateData();
    console.log("voy a enviar los datos actualizados:", updateData);

    this.acceptSelection.emit(updateData);
  }

  //Methods for build update data
  private buildUpdateData(): OrderToSupplier {

    const approvedSituationId = 2; // 2 is the ID for 'Approved' situation
    const onHoldStateId = 1; // 1 is the ID for 'on hold' state
    const orderBatchesUpdated = this.getSelectedOrderBatches();
    console.log("TMRE voy a enviar los datos actualizados:", this.getSelectedOrderBatches());

    return {
      id: this.order?.id || 0,
      date: this.order?.date || new Date(),
      description: this.localOrder.description || this.order?.description || 'No description provided',
      admin_restaurant_id: this.order?.admin_restaurant_id || 0,
      supplier_id: this.order?.supplier_id || 0,
      order_to_supplier_state_id: onHoldStateId,
      order_to_supplier_situation_id: approvedSituationId,
      totalPrice: this.calculateNewTotalPrice(),
      estimated_ship_date: this.localOrder.estimatedShipDate || new Date(),
      estimated_ship_time: this.localOrder.estimatedShipTime || new Date(),
      requested_products_count: this.newProductsCount(),
      partially_accepted: this.selection.selected.length < this.batchesOfOrder.length,
      orderBatches: orderBatchesUpdated
    };
  }

  private newProductsCount(): number {
    return this.selection.selected.reduce((sum, supplyId) => {
      const batchInOrder = this.batchesOfOrder.find(b =>
        Number(b.batch?.customSupplyId) === Number(supplyId)
      );
      return sum + (batchInOrder ? 1 : 0);
    }, 0);
  }

  private getSelectedOrderBatches(): OrderToSupplierBatch[] {
    return this.selection.selected
      .map(supplyId => {
        const batchInOrder = this.batchesOfOrder.find(
          b => b.batch?.customSupplyId === supplyId
        );

        console.log('Batch found for supplyId:', supplyId, batchInOrder);

        if (batchInOrder) {
          batchInOrder.accepted = true;
          batchInOrder.supply = this.suppliesDetailsOfOrder.find(
            s => Number(s.id) === Number(batchInOrder.batch?.customSupplyId)
          )
          return batchInOrder;
        }
        return undefined;
      })
      .filter((b): b is OrderToSupplierBatch => b !== undefined)
  }

  calculateNewTotalPrice(): number {
    return this.selection.selected.reduce((total, supplyId) => {
      const supplyInOrder = this.batchesOfOrder.find(s => s.batch?.customSupplyId === supplyId);
      const supplyDetails = this.suppliesDetailsOfOrder.find(s => s.id === supplyId);

      if (supplyInOrder && supplyDetails) {
        return total + (supplyDetails.price * supplyInOrder.quantity);
      }
      return total;
    }, 0);
  }

  //Methods for get data from the order
  productName(supplyId: number): string {
    const supply = this.suppliesDetailsOfOrder.find(s => Number(s.id) === Number(supplyId));
    return supply ? supply.name : 'Unknown Product';
  }

  //Methods for selection management
  get isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.batchesOfOrder.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle(): void {
    if (this.isAllSelected) {
      this.selection.clear();
    } else {
      this.batchesOfOrder.forEach(batch =>
        this.selection.select(Number(batch.batch?.customSupplyId))
      );
    }
  }

  isSelected(supplyId: number): boolean {
    return this.selection.isSelected(supplyId);
  }

  toggleSelection(supplyId: number): void {
    this.selection.toggle(supplyId);
  }

  // Methods for stepper navigation
  nextStep(): void {
    if (this.step < 2) {
      this.step++;
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  closeDialog(): void {
    this.dialogRef?.close();
  }

}
