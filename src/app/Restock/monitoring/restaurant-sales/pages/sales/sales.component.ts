import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RegisterSalesComponent } from '../../components/register-sales/register-sales.component';
import { CommonModule } from '@angular/common';
import { SaleConfirmationComponent } from '../../components/sale-confirmation/sale-confirmation.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ShowSalesNotAddedToInventoryComponent } from '../../components/show-sales-not-added-to-inventory/show-sales-not-added-to-inventory.component';
import { SaleDetailComponent } from '../../components/sale-detail/sale-detail.component';
import { RestaurantSale } from '../../model/restaurant-sale.entity';
import { forkJoin } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { RestaurantSaleService } from '../../services/restaurant-sale.service';
import { SalesAdditionalSupplyService } from '../../services/sales-additional-supply.service';
import { SalesRecipeService } from '../../services/sales-recipe.service';
import { SupplyService } from '../../../../resource/inventory/services/supply.service';
import { RecipeService } from '../../../../planning/recipe/services/recipe.service';

// Sale interface to define the shape of sales data

interface SaleSummary {
  // code: string;
  recipeCount: number;
  additionalSupplyCount: number;
}

function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const names = ['Juan', 'María', 'Luis', 'Ana', 'Pedro', 'Lucía', 'Carlos', 'Sofía', 'Miguel', 'Valeria'];

function getRandomName(): string {
  return names[Math.floor(Math.random() * names.length)];
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    RegisterSalesComponent,
    SaleConfirmationComponent,
    ShowSalesNotAddedToInventoryComponent,
    SaleDetailComponent,
    TranslatePipe
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})



export class SalesComponent implements OnInit {


  salmes: Array<RestaurantSale> = [];

  selectedSale: any = null;

  // Columns to be displayed in the sales history table
  displayedColumns: string[] = ['code', 'plates', 'additonal_supplies', 'actions'];

  // sales already added to inventory
  dataSource = new MatTableDataSource<any>([]);

  // Reference to the paginator component
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Assign the paginator to the table data after the view initializes
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Filter the table by sale code
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Modal flags to control visibility
  showModalRegisterSale = false;               // Controls visibility of register-sales modal
  showModalSaleConfirmation = false;           // Controls visibility of sale-confirmation modal
  showModalSalesNotAddedToInventory = false;   // Controls visibility of show-sales-not-added-to-inventory modal
  showModalSaleDetail = false;   // Controls visibility of sale-detail modal


  // Array of sales not yet added to inventory
  salesNotAddedToInventory: RestaurantSale[] = [];

  // Indicates whether there are historical sales already added to inventory
  showHistorySalesAddedInInventory = true;

  salesWithRecipeAndSupplyCounts: SaleSummary[] = [];

  //Declaracion de services a usar
  private restaurantSaleService: RestaurantSaleService = inject(RestaurantSaleService);
  private salesRecipeService: SalesRecipeService = inject(SalesRecipeService);
  private salesAdditionalSupplyService: SalesAdditionalSupplyService = inject(SalesAdditionalSupplyService);
  private recipeService: RecipeService = inject(RecipeService)
  private supplyService: SupplyService = inject(SupplyService);


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
      this.salesWithRecipeAndSupplyCounts = sales
        .filter(sale => sale.added_inventory === true)
        .map(sale => ({
          id: sale.id,
          code: sale.code,
          recipeCount: recipesMap.get(sale.id ?? -1) || 0,
          additionalSupplyCount: suppliesMap.get(sale.id ?? -1) || 0
        }));

      if (this.salesWithRecipeAndSupplyCounts.length === 0) {
        this.showHistorySalesAddedInInventory = false;
      }
      console.log("salesWithRecipeAndSupplyCounts: ", this.salesWithRecipeAndSupplyCounts);
      this.dataSource.data = this.salesWithRecipeAndSupplyCounts;
    });
  }


  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // Initialize modal flags based on URL query parameters
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.showModalRegisterSale = params['registerSale'] === 'true';
      this.showModalSalesNotAddedToInventory = params['salesNotAddedToInventory'] === 'true';
    });

    //traer todas las ventas
    this.getAllSalesWithDetails();
  }



  // Open the register sale modal by updating the URL query param
  openRegisterSaleModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { registerSale: true },
      queryParamsHandling: 'merge'
    });
  }

  // Open the modal showing sales not yet added to inventory
  openSalesNotAddedToInventoryModal() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { salesNotAddedToInventory: true },
      queryParamsHandling: 'merge'
    });
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

  // Close the register sale modal by clearing the URL query param
  closeRegisterSaleModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { registerSale: null },
      queryParamsHandling: 'merge'
    });
  }

  // Close the Sales Not Added To Inventory modal
  closeSalesNotAddedToInventoryModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { salesNotAddedToInventory: null },
      queryParamsHandling: 'merge'
    });
  }

  // Close the sale detail modal
  closeSaleDetailModal(): void {
    this.showModalSaleDetail = false;
  }

  // Close the sale confirmation modal
  closeSaleConfirmationModal(): void {
    this.showModalSaleConfirmation = false;
  }


  onRegisterSale(data: any) {
    console.log("Registering sale with data: ", data);
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const newSale: RestaurantSale = {
      code: generateRandomCode(), // Código generado aleatoriamente
      diner_name: getRandomName(),
      admin_restaurant_id: 1,
      totalPrice: 10,
      date: formattedDate,
      added_inventory: false
    };

    this.restaurantSaleService.create(newSale).subscribe((response: RestaurantSale) => {
      const saleId = response.id;

      const recipeRequests = data.dishes.map((dish: any) => {
        const saleRecipe: any = {
          sale_id: saleId,
          recipe_id: dish.id,
          quantity: dish.quantity
        };
        return this.salesRecipeService.create(saleRecipe);
      });

      const supplyRequests = data.additionalSupplies.map((supply: any) => {
        const saleAdditionalSupplies: any = {
          sale_id: saleId,
          supplyId: supply.id,
          quantity: supply.quantity
        };
        return this.salesAdditionalSupplyService.create(saleAdditionalSupplies);
      });

      // Esperar a que todos los POSTs se completen
      forkJoin([...recipeRequests, ...supplyRequests]).subscribe({
        next: () => {
          console.log('Todos los registros creados exitosamente');
          this.getAllSalesWithDetails(); // ✅ solo después de que todo se haya guardado
        },
        error: (err) => {
          console.error('Error al crear registros:', err);
        }
      });
    });


    // if the sale was created succesfully ,then show saleConfirmation modal
    this.showModalSaleConfirmation = true;
  }



}
