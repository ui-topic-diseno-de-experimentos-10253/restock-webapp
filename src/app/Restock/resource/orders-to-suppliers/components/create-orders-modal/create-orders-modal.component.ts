import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, signal } from '@angular/core';
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
import { OrderToSupplierService } from '../../services/order-to-supplier.service';
import { TranslatePipe } from '@ngx-translate/core';
import { SessionService } from '../../../../../shared/services/session.service';
import { firstValueFrom } from 'rxjs';
import { CreateOrderRequest, OrderBatchItem } from '../../model/create-order-request';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        TranslatePipe,
        MatProgressSpinnerModule
    ],
})
export class CreateOrdersModalComponent {
    @Input() providerSupplies: any[] = [];
    @Input() providerProfiles: any[] = [];
    @Input() isLoadingBatches = false;
    @Output() orderCreated = new EventEmitter<void>();

    @ViewChild('createOrderModal') createOrderModalRef!: TemplateRef<any>;

    tabIndex = 0;
    selectedSupply: any = null;
    filteredSuppliers: any[] = [];
    currentSelections: any[] = [];
    fullOrder: any[] = [];
    sortAsc = true;
    isSubmitting = signal(false);

    constructor(private dialog: MatDialog,
        private orderToSupplierService: OrderToSupplierService,
        private sessionService: SessionService,
        private snackBar: MatSnackBar) {

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
                name: `${profile?.name || ''} ${profile?.lastName || ''}`.trim() || `Supplier ${s.user_id}`,
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
        const adminRestaurantId = this.sessionService.getUserId();
        if (!adminRestaurantId) {
            console.error('Cannot create order: missing authenticated user');
            this.snackBar.open('Missing authenticated user', 'Close', { duration: 3000 });
            return;
        }

        try {
            this.isSubmitting.set(true);
            for (const supply of finalOrder) {
                if (!supply.batches || supply.batches.length === 0) {
                    console.warn('No se encontraron batches para el insumo:', supply);
                    continue;
                }

                const batches = this.allocateRequestedQuantity(supply.quantity, supply.batches);
                if (batches.length === 0) {
                    console.warn('No hay stock suficiente para crear la orden del insumo:', supply);
                    this.snackBar.open(`Insufficient stock for ${supply.supplyName}`, 'Close', { duration: 3000 });
                    continue;
                }

                const request: CreateOrderRequest = {
                    adminRestaurantId,
                    supplierId: Number(supply.user_id),
                    batches,
                    description: `Order for ${supply.supplyName}`,
                    estimatedShipDate: new Date().toISOString().split('T')[0],
                    estimatedShipTime: '09:00'
                };

                await firstValueFrom(this.orderToSupplierService.create(request));
            }

            this.orderCreated.emit();
            this.closeModal();
        } catch (error) {
            console.error('Error al crear una de las órdenes o relaciones:', error);
            this.snackBar.open('Error creating order', 'Close', { duration: 3000 });
        } finally {
            this.isSubmitting.set(false);
        }
    }

    private allocateRequestedQuantity(requested: number, batches: any[]): OrderBatchItem[] {
        let remaining = Number(requested || 0);
        const result: OrderBatchItem[] = [];

        for (const batch of batches) {
            if (remaining <= 0) break;
            const batchId = Number(batch.id);
            const stock = Number(batch.stock || 0);
            if (!batchId || stock <= 0) continue;

            const quantity = Math.min(stock, remaining);
            result.push({
                batchId,
                quantity,
                accept: true
            });
            remaining -= quantity;
        }

        return remaining > 0 ? [] : result;
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
