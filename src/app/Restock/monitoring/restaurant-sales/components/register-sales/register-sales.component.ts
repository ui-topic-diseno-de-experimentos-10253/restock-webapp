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
import { RecipeService } from '../../../../planning/recipe/services/recipe.service';
import { Recipe } from '../../../../planning/recipe/model/recipe.entity';
import { Supply } from '../../../../resource/inventory/model/supply.entity';
import { SupplyService } from '../../../../resource/inventory/services/supply.service';

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
    MatPaginatorModule
  ],
  templateUrl: './register-sales.component.html',
  styleUrl: './register-sales.component.css'
})
export class RegisterSalesComponent implements OnInit {
  @Output() close = new EventEmitter<void>(); // Emits when modal should be closed
  @Output() registersale = new EventEmitter<{ dishes: any[]; additionalSupplies: any[] }>(); // Emits sale data for registration

  // Reactive data sources for the selected dishes and additional supplies
  selectedDishes = new MatTableDataSource<any>([]);
  selectedAdditionalSupplies = new MatTableDataSource<any>([]);

  // Closes the component (used by close or cancel buttons)
  closeComponente() {
    this.close.emit();
  }

  // Available dishes and additional supplies //id name price
  availableDishes: Recipe[] = [];

  availableAdditionalSupplies: Supply[] = [];

  // Table column definitions
  displayedColumnsPlatos: string[] = ['name', 'price', 'quantity', 'actions'];
  displayedColumnsInsumos: string[] = ['name', 'price', 'quantity', 'actions'];

  /**
   * Adds a dish to the selection if it hasn't been added yet.
   * @param id Dish ID
   */
  agregarPlato(id: number) {
    const dish = this.availableDishes.find(p => p.id === id);
    const current = this.selectedDishes.data;

    if (dish && !current.find(p => p.id === id)) {
      current.push({ ...dish, quantity: 1 });
      this.selectedDishes.data = [...current]; // Triggers table update
    }
  }

  /**
   * Adds an additional supply to the selection if it hasn't been added yet.
   * @param id Supply ID
   */
  agregarInsumo(id: number) {
    const supply = this.availableAdditionalSupplies.find(i => i.id === id);
    const current = this.selectedAdditionalSupplies.data;

    if (supply && !current.find(i => i.id === id)) {
      current.push({ ...supply, quantity: 1 });
      this.selectedAdditionalSupplies.data = [...current]; // Triggers table update
    }
  }

  /**
   * Removes a dish from the selected list.
   * @param id Dish ID
   */
  deleteDish(id: number) {
    this.selectedDishes.data = this.selectedDishes.data.filter(p => p.id !== id);
  }

  /**
   * Removes a supply from the selected list.
   * @param id Supply ID
   */
  deleteAdditionalSupply(id: number) {
    this.selectedAdditionalSupplies.data = this.selectedAdditionalSupplies.data.filter(p => p.id !== id);
  }

  /**
   * Validates and emits the selected items as a sale.
   * Also triggers modal close after submission.
   */
  registerSale() {
    const dishes = this.selectedDishes.data;
    const supplies = this.selectedAdditionalSupplies.data;

    if (dishes.length === 0 && supplies.length === 0) {
      alert('Please select at least one dish or supply before registering the sale.');
      return;
    }

    this.registersale.emit({
      dishes: dishes,
      additionalSupplies: supplies
    });

    this.close.emit(); // Close modal after registering sale
  }

  private recipeService: RecipeService = inject(RecipeService);
  private supplyService: SupplyService = inject(SupplyService);


  ngOnInit(): void {
    this.getAllRecipes();
    this.getAllAdditionalSupplies();
  }

  private getAllRecipes() {
    this.recipeService.getAll().subscribe((response: Array<Recipe>) => {
      this.availableDishes = response;
    });
  }

  private getAllAdditionalSupplies() {
    this.supplyService.getAll().subscribe((response: Array<Supply>) => {
      this.availableAdditionalSupplies = response;
    });
  }

}
