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
import { SalesRecipeService } from '../../services/sales-recipe.service';
import { SalesAdditionalSupplyService } from '../../services/sales-additional-supply.service';
import { SupplyService } from '../../../../resource/inventory/services/supply.service';
import { RecipeService } from '../../../../planning/recipe/services/recipe.service';
import { TranslatePipe } from '@ngx-translate/core';

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
    TranslatePipe
  ],
  templateUrl: './show-sales-not-added-to-inventory.component.html',
  styleUrl: './show-sales-not-added-to-inventory.component.css'
})
export class ShowSalesNotAddedToInventoryComponent implements OnInit {
  selectedSale: any = null;
  showModalSaleDetail = false;   // Controls visibility of sale-detail modal


  constructor(
    private snackBar: MatSnackBar,
  ) { }

  @Output() close = new EventEmitter<void>(); //Envento que se envia para cerrar el modal

  //Declaracion de services a usar
  private restaurantSaleService: RestaurantSaleService = inject(RestaurantSaleService);
  private salesRecipeService: SalesRecipeService = inject(SalesRecipeService);
  private salesAdditionalSupplyService: SalesAdditionalSupplyService = inject(SalesAdditionalSupplyService);
  private recipeService: RecipeService = inject(RecipeService)
  private supplyService: SupplyService = inject(SupplyService);

  dataSource = new MatTableDataSource<any>([]);

  salesNotAddedToInventoryWithRecipeAndSupplyCounts: any[] = [];


  //Cerrar componente al presionar "x" o "cancel"
  closeComponent() {
    this.close.emit(); // evento para cerrar modal
  }

  // Columnas
  displayedColumnssalesNotAddedToInventory: string[] = ['code', 'quantity_plates', 'quantity_additonal_supplies', 'actions'];

  //sales selected to move to inventory
  selectedSales: any[] = [];

  toggleSelection(element: any, checked: boolean) {
    if (checked) {
      this.selectedSales.push(element);
    } else {
      this.selectedSales = this.selectedSales.filter(s => s.code !== element.code);
    }
    console.log("selected sales: ", this.selectedSales);
  }

  isSelected(element: any): boolean {
    return this.selectedSales.some(s => s.code === element.code);
  }

  //Rrgistra las ventas seleccionadas a inventario
  registerSalesToInventory() {

    //traer el sale original de db.json
    this.restaurantSaleService.getAll().subscribe(sales => {
      this.selectedSales = sales;

      const updateCalls = this.selectedSales.map(sale =>
        this.restaurantSaleService.update(sale.id, {
          ...sale,
          added_inventory: true
        })
      );

      forkJoin(updateCalls).subscribe({
        next: () => {
          this.snackBar.open('Sales added to inventory successfully ✅', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-success'
          });
          this.closeComponent();
        },
        error: () => {
          this.snackBar.open('Error updating sales ❌', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
        }
      });
    })





  }


  toggleAllSelection(checked: boolean) {
    if (checked) {
      this.selectedSales = this.dataSource.data.slice(); // Copia todos los elementos
    } else {
      this.selectedSales = [];
    }
    console.log("selected sales: ", this.selectedSales);

  }

  isAllSelected(): boolean {
    return this.selectedSales.length === this.dataSource.data.length;
  }

  // Open the modal showing sales detail
  openSaleDetail(sale: any) {

    const saleId = sale.id;

    const recipes$ = this.salesRecipeService.getByQuery("sale_id", saleId)
    const supplies$ = this.salesAdditionalSupplyService.getByQuery("sale_id", saleId);
    const allRecipes$ = this.recipeService.getAll();
    const allSupplies$ = this.supplyService.getAll();

    forkJoin([recipes$, supplies$, allRecipes$, allSupplies$]).subscribe(
      ([recipes, additionalSupplies, allRecipes, allSupplies]) => {
        const enrichedDishes = recipes.map((sr: any) => {
          const recipe = allRecipes.find((r: any) => r.id === sr.recipe_id);
          return {
            name: recipe?.name || 'Desconocido',
            unitPrice: recipe?.price || 0,
            quantity: sr.quantity
          };
        });

        const enrichedSupplies = additionalSupplies.map((sas: any) => {
          const supply = allSupplies.find((s: any) => s.id === sas.supplyId);
          return {
            name: supply?.name || 'Desconocido',
            unitPrice: supply?.price || 0,
            quantity: sas.quantity
          };
        });

        this.selectedSale = {
          ...sale,
          dishes: enrichedDishes,
          additionalSupplies: enrichedSupplies
        };

        console.log('Selected sale enriched:', this.selectedSale);
        this.showModalSaleDetail = true;
      },
      error => {
        console.error('Error loading sale details:', error);
      }
    );
  }

  private getAllSalesWithDetails() {
    // Ejecutar todas las llamadas en paralelo
    forkJoin({
      sales: this.restaurantSaleService.getAll(),
      salesRecipes: this.salesRecipeService.getAll(),
      salesSupplies: this.salesAdditionalSupplyService.getAll()
    }).subscribe(({ sales, salesRecipes, salesSupplies }) => {

      // Agrupar recetas por sale_id
      const recipesMap = new Map<number, number>();
      salesRecipes.forEach(recipe => {
        recipesMap.set(recipe.sale_id ?? 0, (recipesMap.get(recipe.sale_id ?? 0) || 0) + (recipe.quantity ?? 0));
      });

      // Agrupar insumos adicionales por sale_id
      const suppliesMap = new Map<number, number>();
      salesSupplies.forEach(supply => {
        suppliesMap.set(supply.sale_id, (suppliesMap.get(supply.sale_id) || 0) + (supply.quantity ?? 0));
      });

      // Crear arreglo final
      this.salesNotAddedToInventoryWithRecipeAndSupplyCounts = sales
        .filter(sale => sale.added_inventory === false)
        .map(sale => ({
          id: sale.id,
          code: sale.code,
          recipeCount: recipesMap.get(sale.id ?? -1) || 0,
          additionalSupplyCount: suppliesMap.get(sale.id ?? -1) || 0
        }));

      console.log("salesNotAddedToInventoryWithRecipeAndSupplyCounts: ", this.salesNotAddedToInventoryWithRecipeAndSupplyCounts);
      this.dataSource.data = this.salesNotAddedToInventoryWithRecipeAndSupplyCounts;

    });
  }

  ngOnInit() {
    this.getAllSalesWithDetails();
  }

  // Close the sale detail modal
  closeSaleDetailModal(): void {
    this.showModalSaleDetail = false;
  }


}
