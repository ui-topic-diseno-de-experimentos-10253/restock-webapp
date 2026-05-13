import {Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import {MatDialogActions, MatDialogRef} from '@angular/material/dialog';
import {MatNativeDateModule} from '@angular/material/core';
import {OrderToSupplier} from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-edit-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogActions,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatNativeDateModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.css'
})
export class EditOrderComponent implements OnInit {

  localOrder = {
    description: '',
    estimatedShipDate: new Date(),
    estimatedShipTime: new Date(),
    stateId: 0,
  };

  steps: string[] = ["On hold", "Preparing", "On the way", "Delivered"];
  statusToStepIndex: { [key: number]: number } = { 1: 0, 2: 1, 3: 2, 4: 3 };
  stepIndexToStatus: { [key: number]: number } = { 0: 1, 1: 2, 2: 3, 3: 4 };
  currentIndex: number = 0;
  draggingIndex: number | null = null;

  order: OrderToSupplier | null = null;

  @Output() updateOrder = new EventEmitter<OrderToSupplier>();

  constructor(
    private snackBar: MatSnackBar,
    @Optional() @Inject('initialData') private injectedData?: any,
    @Optional() private dialogRef?: MatDialogRef<EditOrderComponent>
  ) {}

  ngOnInit(): void {

    if (this.injectedData) {
      this.order = this.injectedData.order || null;

      if (this.order?.state?.id) {
        this.localOrder.stateId = this.order.state.id;
        this.currentIndex = this.statusToStepIndex[this.order.state.id] ?? 0;
      }

      this.localOrder.description = this.order?.description || '';
      this.localOrder.estimatedShipDate = this.order?.estimated_ship_date || new Date();
      this.localOrder.estimatedShipTime = this.order?.estimated_ship_time || new Date();
    }
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  onUpdateOrder(): void
  {
    const updateData = this.buildUpdateData();
    console.log("voy a enviar los datos actualizados AQUUIEI:", updateData);
    this.updateOrder.emit(updateData);
  }

  //Methods for build update data
  private buildUpdateData(): OrderToSupplier {
    return {
      id: this.order?.id || 0,
      date: this.order?.date || new Date(),
      description: this.localOrder.description || this.order?.description || 'No description provided', // New
      admin_restaurant_id: this.order?.admin_restaurant_id || 0,
      supplier_id: this.order?.supplier_id || 0,
      order_to_supplier_state_id:  this.localOrder.stateId, // New
      order_to_supplier_situation_id:  this.order?.order_to_supplier_situation_id || 0,
      totalPrice: this.order?.totalPrice || 0,
      estimated_ship_date: this.localOrder.estimatedShipDate || this.order?.estimated_ship_date || new Date(), // New
      estimated_ship_time: this.localOrder.estimatedShipTime || this.order?.estimated_ship_time ||new Date(), // New
      requested_products_count: this.order?.requested_products_count || 0,
      partially_accepted: this.order?.partially_accepted || false,
      orderBatches: this.order?.orderBatches,
      situation: this.order?.situation,
    };
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.currentIndex = index;

    this.localOrder.stateId = this.stepIndexToStatus[index];

    this.draggingIndex = null;
  }

  onDragStart(event: DragEvent): void {
    this.draggingIndex = this.currentIndex;
  }

  getProgressWidth(): string {
    return `${(this.currentIndex / (this.steps.length - 1)) * 100}%`;
  }

  isStepCompleted(index: number): boolean {
    return this.currentIndex > index;
  }

  isStepActive(index: number): boolean {
    return this.currentIndex === index;
  }

  isStepPending(index: number): boolean {
    return this.currentIndex < index;
  }
}
