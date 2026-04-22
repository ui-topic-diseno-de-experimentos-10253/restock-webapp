import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { OrderToSupplier } from '../../model/order-to-supplier.entity';
import { OrderToSupplierService } from '../../services/order-to-supplier.service';
import { OrderToSupplierBatch } from '../../model/order-to-supplier-batch.entity';
import { OrderToSupplierBatchService } from '../../services/order-to-supplier-batch.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'create-orders-modal',
    templateUrl: './create-orders-modal.component.html',
    styleUrls: ['./create-orders-modal.component.css'],
    imports: [CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        MatTableModule,
        MatIconModule,
        MatCardModule,
        MatCheckboxModule,
        MatTabsModule,
        TranslatePipe
    ],
})
export class CreateOrdersModalComponent {
    @Input() providerSupplies: any[] = [];
    @Input() providerProfiles: any[] = [];

    @ViewChild('createOrderModal') createOrderModalRef!: TemplateRef<any>;

    tabIndex = 0;
    selectedSupply: any = null;
    filteredSuppliers: any[] = [];
    currentSelections: any[] = [];
    fullOrder: any[] = [];
    sortAsc = true;

    constructor(private dialog: MatDialog,
        private orderToSupplierService: OrderToSupplierService,
        private orderToSupplierBatchService: OrderToSupplierBatchService) {

    }




    openCreateOrderModal(): void {
        this.resetAll();
        this.dialog.open(this.createOrderModalRef, {
            width: '500px',
            height: '85%',
            minHeight: '600px',
        });
    }

    closeModal(): void {
        this.dialog.closeAll();
    }

    onSupplyChange(): void {
        if (!this.selectedSupply) {
            this.filteredSuppliers = [];
            return;
        }

        const supplyId = this.selectedSupply.id;

        const matchingProviders = this.providerSupplies.filter(p => String(p.id) === String(supplyId));
        const totalAvailable = (this.selectedSupply.batches || []).reduce((sum: number, batch: any) => {
            return sum + Number(batch.stock || 0);
        }, 0);

        this.filteredSuppliers = matchingProviders.map(s => {
            const already = this.fullOrder.find(o =>
                o.supplierId === s.supplierId && o.id === supplyId
            );

            const profile = this.providerProfiles.find(p => p.id === s.user_id);
            return {
                ...s,
                selected: !!already,
                disabled: !!already,
                name: `${profile?.name || ''} ${profile?.lastName || ''}`.trim(),
                available: totalAvailable
            };
        });
    }
    removeSupply(supplyToRemove: any): void {
        this.currentSelections = this.currentSelections.filter(
            s =>
                !(
                    s.supplyId === supplyToRemove.supplyId &&
                    s.supplierId === supplyToRemove.supplierId
                )
        );

        this.fullOrder = this.fullOrder.filter(
            s =>
                !(
                    s.supplyId === supplyToRemove.supplyId &&
                    s.supplierId === supplyToRemove.supplierId
                )
        );

        this.filteredSuppliers = this.filteredSuppliers.map(s => {
            if (
                s.supplierId === supplyToRemove.supplierId &&
                s.id === supplyToRemove.supplyId
            ) {
                return {
                    ...s,
                    selected: false,
                    disabled: false
                };
            }
            return s;
        });

        if (
            this.selectedSupply &&
            this.selectedSupply.id === supplyToRemove.supplyId
        ) {
            this.selectedSupply = null;
        }
    }
    toggleSortOrder(): void {
        this.sortAsc = !this.sortAsc;
        this.filteredSuppliers.sort((a, b) =>
            this.sortAsc ? a.price - b.price : b.price - a.price
        );
    }

    hasSelection(): boolean {
        return this.filteredSuppliers.some(s => s.selected);
    }
    nextTab(): void {
        const selected = this.filteredSuppliers.filter(s => s.selected);
        if (!selected.length || !this.selectedSupply) return;

        const supplyId = this.selectedSupply.id;
        const alreadyExists = this.fullOrder.some(o => o.supplyId === supplyId);
        console.log('¿Ya existe ese supplyId en fullOrder?:', alreadyExists);

        if (alreadyExists) {
            alert('Este insumo ya ha sido agregado a la orden. No puedes agregarlo de nuevo.');
            return;
        }

        this.currentSelections = selected.map(s => ({
            ...s,
            supplyId: supplyId,
            supplyName: this.selectedSupply.name,
            quantity: 1,
        }));

        setTimeout(() => {
            this.tabIndex = 1;
        });
    }

    addMoreSupply(): void {
        const supplyId = this.selectedSupply?.id;
        console.log("Lista actual de selecciones:", this.currentSelections);
        console.log("Lista completa de órdenes:", this.fullOrder);
        if (!this.currentSelections.length) {
            console.warn('currentSelections está vacío. No se agregará nada.');
            return;
        }

        this.fullOrder = this.fullOrder.filter(o => o.supplyId !== supplyId);
        this.fullOrder.push(...this.currentSelections.map(o => ({ ...o })));

        this.resetStep();
    }

    async onCreateOrder(): Promise<void> {
        const finalOrder = [...this.fullOrder, ...this.currentSelections];
        console.log('Orden final a enviar:', finalOrder);
        try {
            for (const supply of finalOrder) {
                if (!supply.batches || supply.batches.length === 0) {
                    console.warn('No se encontraron batches para el insumo:', supply);
                    continue;
                }

                const newOrder = new OrderToSupplier({
                    date: new Date(),
                    admin_restaurant_id: 2,
                    supplier_id: supply.user_id,
                    order_to_supplier_state_id: 1,
                    order_to_supplier_situation_id: 1,
                    partially_accepted: false,
                    totalPrice: supply.quantity * supply.price,
                    estimated_ship_date: null,
                    estimated_ship_time: null,
                    requested_products_count: supply.batches.length
                });

                const createdOrder = await this.orderToSupplierService.createOrder(newOrder);

                for (const batch of supply.batches) {
                    if (!batch.id) {
                        console.warn('Batch inválido para el insumo:', supply);
                        continue;
                    }

                    const newSupplyRelation = new OrderToSupplierBatch({
                        order_to_supplier_id: createdOrder.id,
                        batch_id: batch.id,
                        quantity: supply.quantity,
                        accepted: false,
                    });

                    await this.orderToSupplierBatchService.createSupply(newSupplyRelation);
                }
            }

            this.closeModal();
        } catch (error) {
            console.error('Error al crear una de las órdenes o relaciones:', error);
        }
    }

    getTotal(): number {
        const allItems = [...this.fullOrder, ...this.currentSelections];
        return allItems.reduce((sum, s) => {
            const qty = s.quantity || 1;
            return sum + s.price * qty;
        }, 0);
    }

    private resetStep(): void {
        this.selectedSupply = null;
        this.filteredSuppliers = [];
        this.currentSelections = [];
        this.tabIndex = 0;
    }

    private resetAll(): void {
        this.fullOrder = [];
        this.resetStep();
    }
}
