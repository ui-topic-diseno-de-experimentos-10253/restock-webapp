import { Component, TemplateRef, ViewChild, Input } from '@angular/core';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OrderToSupplier } from '../../model/order-to-supplier.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'order-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NgForOf,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe
  ],
  templateUrl: './order-details-modal.component.html',
  styleUrl: './order-details-modal.component.css'
})
export class OrderDetailsModalComponent {
  @Input() order!: OrderToSupplier;
  @Input() providerProfiles: any[] = [];
  @Input() suppliers: { id: number; name: string }[] = [];
  @ViewChild('orderDetailsTemplate') orderDetailsRef!: TemplateRef<any>;
  constructor(private dialog: MatDialog) { }
  providerProfile: any;

  open(order: OrderToSupplier): void {
    this.order = order;
    console.log('Opening order details for:', this.order);
    this.providerProfile = this.providerProfiles.find(
      profile => Number(profile.user_id ?? profile.userId ?? profile.id) === Number(this.order.supplier_id)
    );
    if (!this.providerProfile) {
      const supplier = this.suppliers.find(s => Number(s.id) === Number(this.order.supplier_id));
      if (supplier) {
        this.providerProfile = {
          name: supplier.name,
          lastName: '',
          companyName: supplier.name,
          phone: '-',
          business_address: '-',
          image: 'https://via.placeholder.com/64'
        };
      }
    }
    this.dialog.open(this.orderDetailsRef, { width: '600px' });
  }

  close(): void {
    this.dialog.closeAll();
  }

  get hasOrderBatches(): boolean {
  return Array.isArray(this.order?.orderBatches) && this.order!.orderBatches.length > 0;
}
}
