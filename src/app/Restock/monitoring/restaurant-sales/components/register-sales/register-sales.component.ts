import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../../../planning/recipe/services/recipe.service';
import { Recipe } from '../../../../planning/recipe/model/recipe.entity';
import { Supply } from '../../../../resource/inventory/model/supply.entity';
import { SupplyService } from '../../../../resource/inventory/services/supply.service';
import { RestaurantSaleService } from '../../services/restaurant-sale.service';
import { CreateSaleDto } from '../../model/restaurant-sale.entity';

// TAX rate applied to subtotal (10 %)
const TAX_RATE = 0.10;

@Component({
    selector: 'app-register-sales',
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
    ],
    templateUrl: './register-sales.component.html',
    styleUrl: './register-sales.component.css'
})
export class RegisterSalesComponent implements OnInit {
    /** Emits when the modal should be closed */
    @Output() close = new EventEmitter<void>();
    /** Emits the registered sale back to the parent */
    @Output() registersale = new EventEmitter<any>();

    // Reactive data sources for selected items in the tables
    selectedDishes = new MatTableDataSource<any>([]);
    selectedAdditionalSupplies = new MatTableDataSource<any>([]);

    // Lists loaded from back-end
    availableDishes: Recipe[] = [];
    availableAdditionalSupplies: Supply[] = [];

    // Table column definitions
    displayedColumnsPlatos: string[] = ['name', 'price', 'quantity', 'actions'];
    displayedColumnsInsumos: string[] = ['name', 'price', 'quantity', 'actions'];

    private recipeService: RecipeService = inject(RecipeService);
    private supplyService: SupplyService = inject(SupplyService);
    private saleService: RestaurantSaleService = inject(RestaurantSaleService);
    private snackBar: MatSnackBar = inject(MatSnackBar);

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.getAllRecipes();
        this.getAllAdditionalSupplies();
    }

    // ── Selection helpers ──────────────────────────────────────────────────────

    /** Adds a dish to the selection if not already present */
    agregarPlato(id: number): void {
        const dish = this.availableDishes.find(p => p.id === id);
        const current = this.selectedDishes.data;
        if (dish && !current.find(p => p.id === id)) {
            current.push({ ...dish, quantity: 1 });
            this.selectedDishes.data = [...current];
        }
    }

    /** Adds an additional supply to the selection if not already present */
    agregarInsumo(id: number): void {
        const supply = this.availableAdditionalSupplies.find(i => i.id === id);
        const current = this.selectedAdditionalSupplies.data;
        if (supply && !current.find(i => i.id === id)) {
            current.push({ ...supply, quantity: 1 });
            this.selectedAdditionalSupplies.data = [...current];
        }
    }

    /** Removes a dish from the selection */
    deleteDish(id: number): void {
        this.selectedDishes.data = this.selectedDishes.data.filter(p => p.id !== id);
    }

    /** Removes a supply from the selection */
    deleteAdditionalSupply(id: number): void {
        this.selectedAdditionalSupplies.data = this.selectedAdditionalSupplies.data.filter(p => p.id !== id);
    }

    // ── Close ──────────────────────────────────────────────────────────────────

    closeComponente(): void {
        this.close.emit();
    }

    // ── Register sale ──────────────────────────────────────────────────────────

    registerSale(): void {
        const dishes = this.selectedDishes.data;
        const supplies = this.selectedAdditionalSupplies.data;

        if (dishes.length === 0 && supplies.length === 0) {
            this.snackBar.open(
                'Please select at least one dish or supply before registering the sale.',
                'Close',
                { duration: 3000 }
            );
            return;
        }

        // Read authenticated user id from localStorage
        const userId = this.getUserIdFromStorage();
        if (!userId) {
            this.snackBar.open('User not authenticated. Please log in again.', 'Close', { duration: 3000 });
            return;
        }

        // Build selections using the API field names
        const dishSelections = dishes.map(d => ({
            dishId: d.id,
            quantity: d.quantity,
            unitPrice: d.totalPrice ?? d.price ?? 0   // tolerate both field names
        }));

        const supplySelections = supplies.map(s => ({
            supplyId: s.id,
            quantity: s.quantity,
            unitPrice: s.price ?? 0
        }));

        // Calculate totals
        const subtotal = this.calcSubtotal(dishSelections, supplySelections);
        const taxes = parseFloat((subtotal * TAX_RATE).toFixed(2));
        const totalCost = parseFloat((subtotal + taxes).toFixed(2));

        const dto: CreateSaleDto = {
            dishSelections,
            supplySelections,
            subtotal,
            taxes,
            totalCost,
            userId
        };

        this.saleService.create(dto).subscribe({
          
            next: sale => {
              console.log('DTO enviado:', JSON.stringify(dto, null, 2));
                this.snackBar.open('Sale registered successfully ', 'Close', { duration: 3000 });
                this.registersale.emit(sale);
                this.close.emit();
            },
            error: err => {
                console.error('Error registering sale:', err);
                this.snackBar.open('Error registering sale ', 'Close', { duration: 3000 });
            }
            
        });
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private getUserIdFromStorage(): number | null {
        const raw = localStorage.getItem('user_id');
        if (!raw) return null;
        const num = parseInt(raw, 10);
        return isNaN(num) ? null : num;
    }

    private calcSubtotal(
        dishes: { quantity: number; unitPrice: number }[],
        supplies: { quantity: number; unitPrice: number }[]
    ): number {
        const dishTotal = dishes.reduce((acc, d) => acc + d.quantity * d.unitPrice, 0);
        const supplyTotal = supplies.reduce((acc, s) => acc + s.quantity * s.unitPrice, 0);
        return parseFloat((dishTotal + supplyTotal).toFixed(2));
    }

    private getAllRecipes(): void {
        this.recipeService.getAll().subscribe((response: Array<Recipe>) => {
          console.log('Dish example:', JSON.stringify(response[0], null, 2));
            this.availableDishes = response;
        });
    }

    private getAllAdditionalSupplies(): void {
        this.supplyService.getAll().subscribe((response: Array<Supply>) => {
          console.log('Supply example:', JSON.stringify(response[0], null, 2));
            this.availableAdditionalSupplies = response;
        });
    }
}