import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';
import { RestaurantSaleService } from '../../services/restaurant-sale.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

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
export class SalesComponent implements OnInit, AfterViewInit {

  selectedSale: any = null;

  displayedColumns: string[] = ['code', 'plates', 'additonal_supplies', 'actions'];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Modal visibility flags
  showModalRegisterSale = false;
  showModalSaleConfirmation = false;
  showModalSalesNotAddedToInventory = false;
  showModalSaleDetail = false;

  showHistorySalesAddedInInventory = false;

  private restaurantSaleService: RestaurantSaleService = inject(RestaurantSaleService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.showModalRegisterSale = params['registerSale'] === 'true';
      this.showModalSalesNotAddedToInventory = params['salesNotAddedToInventory'] === 'true';
    });

    this.loadSales();
  }

  // ── Data loading ─────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/sales returns dishSelections/supplySelections as empty arrays.
   * We then call GET /api/v1/sales/:id for each sale to get the full detail,
   * and build the table rows from those responses.
   */
  private loadSales(): void {
    
    this.restaurantSaleService.getAll().subscribe({
      
      next: (sales: RestaurantSale[]) => {
        console.log('Loaded sales:', sales);
        if (sales.length === 0) {
          this.dataSource.data = [];
          this.showHistorySalesAddedInInventory = false;
          return;
        }

        // Fetch full detail for every sale in parallel
        const detailCalls = sales.map(s => this.restaurantSaleService.getById(s.id!));

        forkJoin(detailCalls).subscribe({
          next: (detailed: RestaurantSale[]) => {
            const rows = detailed.map((sale, index) => ({
              id: sale.id,
              // saleNumber is null from the API — fall back to a generated label
              code: sale.saleNumber || `SALE-${sale.id}`,
              status: sale.status,
              registeredDate: sale.registeredDate,
              totalCost: sale.totalCost,
              subtotal: sale.subtotal,
              taxes: sale.taxes,
              recipeCount: (sale.dishSelections || []).reduce(
                (acc, ds) => acc + (ds.quantity || 0), 0
              ),
              additionalSupplyCount: (sale.supplySelections || []).reduce(
                (acc, ss) => acc + (ss.quantity || 0), 0
              ),
              dishSelections: sale.dishSelections || [],
              supplySelections: sale.supplySelections || [],
            }));

            this.dataSource.data = rows;
            this.showHistorySalesAddedInInventory = rows.length > 0;
          },
          error: err => {
            console.error('Error loading sale details:', err);
            this.snackBar.open('Error loading sale details', 'Close', { duration: 3000 });
          }
        });
      },
      
      error: err => {
        console.error('Error loading sales:', err);
        this.snackBar.open('Error loading sales', 'Close', { duration: 3000 });
      }
    });
    
  }

  // ── Modal openers ─────────────────────────────────────────────────────────────

  openRegisterSaleModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { registerSale: true },
      queryParamsHandling: 'merge'
    });
  }

  openSalesNotAddedToInventoryModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { salesNotAddedToInventory: true },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Opens the sale detail modal.
   * The row already has full dishSelections/supplySelections from loadSales(),
   * so no extra HTTP call needed here.
   */
  openSaleDetail(sale: any): void {
    this.selectedSale = {
      ...sale,
      dishes: (sale.dishSelections || []).map((ds: any) => ({
        name: `Dish #${ds.dishId}`,
        unitPrice: ds.unitPrice,
        quantity: ds.quantity
      })),
      additionalSupplies: (sale.supplySelections || []).map((ss: any) => ({
        name: `Supply #${ss.supplyId}`,
        unitPrice: ss.unitPrice,
        quantity: ss.quantity
      }))
    };
    this.showModalSaleDetail = true;
  }

  // ── Modal closers ─────────────────────────────────────────────────────────────

  closeRegisterSaleModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { registerSale: null },
      queryParamsHandling: 'merge'
    });
  }

  closeSalesNotAddedToInventoryModal(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { salesNotAddedToInventory: null },
      queryParamsHandling: 'merge'
    });
    this.loadSales();
  }

  closeSaleDetailModal(): void {
    this.showModalSaleDetail = false;
  }

  closeSaleConfirmationModal(): void {
    this.showModalSaleConfirmation = false;
  }

  // ── Sale registration callback ────────────────────────────────────────────────

  onRegisterSale(sale: RestaurantSale): void {
    this.showModalSaleConfirmation = true;
    this.loadSales();
  }
}