import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaleDetailComponent } from '../sale-detail/sale-detail.component';
import { forkJoin } from 'rxjs';
import { RestaurantSaleService } from '../../services/restaurant-sale.service';
import { TranslatePipe } from '@ngx-translate/core';
import { RestaurantSale } from '../../model/restaurant-sale.entity';

@Component({
    selector: 'app-show-sales-not-added-to-inventory',
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        SaleDetailComponent,
        TranslatePipe,
    ],
    templateUrl: './show-sales-not-added-to-inventory.component.html',
    styleUrl: './show-sales-not-added-to-inventory.component.css'
})
export class ShowSalesNotAddedToInventoryComponent implements OnInit {

    /** Currently selected sale for the detail modal */
    selectedSale: any = null;
    /** Controls visibility of the sale-detail modal */
    showModalSaleDetail = false;

    @Output() close = new EventEmitter<void>();

    private restaurantSaleService: RestaurantSaleService = inject(RestaurantSaleService);
    private snackBar: MatSnackBar = inject(MatSnackBar);

    dataSource = new MatTableDataSource<any>([]);

    displayedColumnssalesNotAddedToInventory: string[] = [
        'code', 'quantity_plates', 'quantity_additonal_supplies', 'actions'
    ];

    /** Sales selected for deletion / cancellation */
    selectedSales: any[] = [];

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.loadSales();
    }

    // ── Close ──────────────────────────────────────────────────────────────────

    closeComponent(): void {
        this.close.emit();
    }

    // ── Selection helpers ──────────────────────────────────────────────────────

    toggleSelection(element: any, checked: boolean): void {
        if (checked) {
            this.selectedSales.push(element);
        } else {
            this.selectedSales = this.selectedSales.filter(s => s.id !== element.id);
        }
    }

    isSelected(element: any): boolean {
        return this.selectedSales.some(s => s.id === element.id);
    }

    toggleAllSelection(checked: boolean): void {
        this.selectedSales = checked ? this.dataSource.data.slice() : [];
    }

    isAllSelected(): boolean {
        return (
            this.dataSource.data.length > 0 &&
            this.selectedSales.length === this.dataSource.data.length
        );
    }

    // ── Cancel selected sales ──────────────────────────────────────────────────

    /**
     * Calls DELETE /api/v1/sales/:id for every selected sale.
     * The API responds 204 on success, 400 if the sale cannot be cancelled,
     * 401 if unauthorized, 404 if not found.
     */
    registerSalesToInventory(): void {
        if (this.selectedSales.length === 0) {
            this.snackBar.open('Please select at least one sale.', 'Close', { duration: 3000 });
            return;
        }

        const deleteCalls = this.selectedSales.map(sale =>
            this.restaurantSaleService.delete(sale.id)
        );

        forkJoin(deleteCalls).subscribe({
            next: () => {
                this.snackBar.open('Sales cancelled successfully', 'Close', {
                    duration: 3000,
                    panelClass: 'snackbar-success'
                });
                this.selectedSales = [];
                this.loadSales(); // Refresh table after deletion
                this.closeComponent();
            },
            error: err => {
                console.error('Error cancelling sales:', err);
                const msg = err?.status === 400
                    ? 'One or more sales cannot be cancelled'
                    : err?.status === 401
                        ? 'Unauthorized. Please log in again'
                        : err?.status === 404
                            ? 'One or more sales were not found'
                            : 'Error cancelling sales';
                this.snackBar.open(msg, 'Close', {
                    duration: 4000,
                    panelClass: 'snackbar-error'
                });
            }
        });
    }

    // ── Sale detail modal ──────────────────────────────────────────────────────

    openSaleDetail(sale: any): void {
        // Enrich the sale object with computed counts for the detail view
        this.selectedSale = {
            ...sale,
            dishes: (sale.dishSelections || []).map((ds: any) => ({
                name: `Dish #${ds.dishId}`,   // Replace with recipe lookup if RecipeService is available
                unitPrice: ds.unitPrice,
                quantity: ds.quantity
            })),
            additionalSupplies: (sale.supplySelections || []).map((ss: any) => ({
                name: `Supply #${ss.supplyId}`, // Replace with supply lookup if SupplyService is available
                unitPrice: ss.unitPrice,
                quantity: ss.quantity
            }))
        };
        this.showModalSaleDetail = true;
    }

    closeSaleDetailModal(): void {
        this.showModalSaleDetail = false;
    }

    // ── Data loading ───────────────────────────────────────────────────────────

    /**
     * Loads all sales from the API and maps them into the table data source.
     * Counts are derived directly from the dishSelections / supplySelections
     * arrays returned by the API — no extra round-trips needed.
     */
    private loadSales(): void {
        this.restaurantSaleService.getAll().subscribe({
            next: (sales: RestaurantSale[]) => {
                const rows = sales.map(sale => ({
                    id: sale.id,
                    code: sale.saleNumber,
                    status: sale.status,
                    registeredDate: sale.registeredDate,
                    totalCost: sale.totalCost,
                    recipeCount: (sale.dishSelections || []).reduce(
                        (acc, ds) => acc + (ds.quantity || 0), 0
                    ),
                    additionalSupplyCount: (sale.supplySelections || []).reduce(
                        (acc, ss) => acc + (ss.quantity || 0), 0
                    ),
                    // Keep raw arrays for the detail modal
                    dishSelections: sale.dishSelections || [],
                    supplySelections: sale.supplySelections || [],
                }));

                this.dataSource.data = rows;
            },
            error: err => {
                console.error('Error loading sales:', err);
                this.snackBar.open('Error loading sales', 'Close', { duration: 3000 });
            }
        });
    }
}