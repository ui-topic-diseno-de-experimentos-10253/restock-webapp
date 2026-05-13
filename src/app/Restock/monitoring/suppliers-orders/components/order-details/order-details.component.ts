// order-details.component.ts
import {
  Component,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit, ChangeDetectorRef, OnInit, Optional, Inject
} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import {OrderToSupplierBatch} from '../../../../resource/orders-to-suppliers/model/order-to-supplier-batch.entity';
import {OrderToSupplier} from '../../../../resource/orders-to-suppliers/model/order-to-supplier.entity';
import {Supply} from '../../../../resource/inventory/model/supply.entity';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatStepperModule,
    DatePipe,
    TranslatePipe
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit, OnChanges, AfterViewInit  {
 //Injected data
  hideState: boolean = false;
  orderBatches: OrderToSupplierBatch[] = [];
  order: OrderToSupplier | null = null;
  adminRestaurantName: string = '';
  orderSuppliesDetails: Supply[] = [];

  dataSource = new MatTableDataSource<OrderToSupplierBatch>();

  step: number = 1;
  steps: string[] = ["On hold", "Preparing", "On the way", "Delivered"];
  statusToStepIndex: { [key: number]: number } = {
    1: 0,  // -> "On hold"
    2: 1,  // -> "Preparing"
    3: 2,  // -> "On the way"
    4: 3,  // -> "Delivered"
  };

  displayedColumns: string[] = ['productName', 'quantity', 'unitMeasure'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() @Inject('initialData') private injectedData?: any,
    @Optional() private dialogRef?: MatDialogRef<OrderDetailsComponent>
  ) {}


  ngOnInit(): void {

    if (this.injectedData) {
      console.log('Datos inyectados:', this.injectedData);

      this.order = this.injectedData.order || null;
      this.adminRestaurantName = this.injectedData.adminRestaurantName || '';
      this.orderSuppliesDetails = this.injectedData.suppliesDetailsOfOrder || [];
      this.orderBatches = this.injectedData.batchesOfOrder || [];
      this.hideState = this.injectedData.hideState || false;

    }

    console.log('Datos finales:', {
      order: this.order,
      supplies: this.orderSuppliesDetails,
      batches: this.orderBatches,
      restaurantName: this.adminRestaurantName
    });

    this.dataSource.data = this.orderBatches;
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['orderBatches']) {

      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      }
    }


    if (changes['modelValue'] && changes['modelValue'].currentValue) {
      this.step = 1;
    }
  }

  ngAfterViewInit(): void {
    // Esperamos al siguiente ciclo de detección de cambios
    Promise.resolve().then(() => {
      if (this.paginator && this.dataSource.data.length > 0) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  get computedCurrentIndex(): number {
    const currentOrderState = this.order?.state;
    return currentOrderState?.id !== undefined
      ? this.statusToStepIndex[currentOrderState.id] ?? 0
      : 1;
  }

  nextStep(): void {
    if (this.step < 2) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  productName(supplyId: number): string {
    const supply = this.orderSuppliesDetails.find(s => Number(s.id) === Number(supplyId));
    return supply ? supply.name : 'Unknown Product';
  }

  onClose(): void {
    this.dialogRef?.close();
  }

  getStepClass(index: number): string {
    const currentIndex = this.computedCurrentIndex;
    if (currentIndex > index) return 'completed';
    if (currentIndex === index) return 'active';
    return 'pending';
  }

  getProgressWidth(): string {
    return `${(this.computedCurrentIndex / (this.steps.length - 1)) * 100}%`;
  }
}
