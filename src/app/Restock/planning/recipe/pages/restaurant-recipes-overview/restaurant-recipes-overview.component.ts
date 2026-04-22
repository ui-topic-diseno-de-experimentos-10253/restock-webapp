import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormFieldSchema} from '../../../../../shared/components/create-and-edit-form/create-and-edit-form.component';
import {DeleteComponent} from '../../../../../shared/components/delete/delete.component';
import {EmptySectionComponent} from '../../../../../shared/components/empty-section/empty-section.component';
import {RecipeService} from '../../services/recipe.service';
import {RecipeSupplyService} from '../../services/recipe-supply.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {Recipe} from '../../model/recipe.entity';
import {firstValueFrom} from 'rxjs';
import {BaseModalService} from '../../../../../shared/services/base-modal.service';
import {CreateAndEditRecipeComponent} from '../../components/create-and-edit-recipe/create-and-edit-recipe.component';
import {RecipeAssembler} from '../../services/recipe.assembler';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-recipes-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSlideToggleModule,
    EmptySectionComponent,
    FormsModule,
    MatIconButton,
    MatButton,
    MatInput,
    TranslatePipe
  ],
  templateUrl: './restaurant-recipes-overview.component.html',
  styleUrls: ['./restaurant-recipes-overview.component.css']
})
export class RestaurantRecipesOverviewComponent implements OnInit {

  recipes: any[] = [];
  search: string = '';
  formVisible = false;
  sortByPrice = false;
  formSchema: FormFieldSchema[] = [];

  private get currentUserId(): number {
    // Fix: get userId from localStorage instead of hardcoding 1
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  constructor(
    private recipeService: RecipeService,
    private recipeSupplyService: RecipeSupplyService,
    private modalService: BaseModalService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.buildFormSchema();
    this.loadRecipes();
  }

  get filteredRecipes(): any[] {
    let filtered = this.recipes.filter(r =>
      r.name?.toLowerCase().includes(this.search.toLowerCase())
    );
    return this.sortByPrice
      ? filtered.sort((a, b) => a.price - b.price)
      : filtered;
  }

  buildFormSchema(): void {
    this.formSchema = [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Name',
        step: 1
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        placeholder: 'Description',
        step: 1
      },
      {
        name: 'price',
        label: 'Total Price',
        type: 'currency',
        placeholder: 'e.g. 29.90',
        format: 'currency',
        step: 2
      },
      {
        name: 'imageUrl',
        label: 'Dish Image',
        type: 'file',
        placeholder: 'Dish Image',
        step: 2
      },
      {
        name: 'supplySelector',
        label: 'Supplies',
        type: 'custom',
        placeholder: '',
        step: 2
      }
    ];
  }

  async loadRecipes(): Promise<void> {
    try {
      const recipes = await firstValueFrom(this.recipeService.getAll());
      this.recipes = await Promise.all(
        recipes.map(async r => {
          const entity = RecipeAssembler.toEntity(r);
          try {
            const supplies = await firstValueFrom(this.recipeSupplyService.getByRecipe(r.id));
            return { ...entity, supplies };
          } catch {
            return { ...entity, supplies: [] };
          }
        })
      );
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.recipes = [];
    }
  }

  openCreateDialog(): void {
    const initialRecipeData = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      userId: this.currentUserId, // Fix: use real userId from localStorage
      supplies: []
    };

    this.modalService.open({
      title: this.translate.instant('recipes.createRecipe'),
      contentComponent: CreateAndEditRecipeComponent,
      schema: this.formSchema,
      initialData: initialRecipeData,
      mode: 'create'
    }).afterClosed().subscribe(async result => {
      if (!result) return;
      try {
        const { supplies, ...recipeData } = result;
        const payload = {
          name: recipeData.name,
          description: recipeData.description,
          imageUrl: recipeData.imageUrl,
          price: recipeData.price,
          userId: this.currentUserId
        };
        const created = await firstValueFrom(this.recipeService.create(payload  as any));
        if (supplies && supplies.length > 0) {
          await firstValueFrom(this.recipeSupplyService.bulkCreate(created.id, supplies));
        }
        await this.loadRecipes();
      } catch (error) {
        console.error('Error creating recipe:', error);
      }
    });
  }

  async openEditDialog(recipe: Recipe): Promise<void> {
    try {
      const supplies = await firstValueFrom(this.recipeSupplyService.getByRecipe(recipe.id));

      const initialRecipeData = {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description || '',
        price: recipe.price,
        imageUrl: recipe.imageUrl,
        userId: recipe.userId,
        supplies: supplies.map(s => ({
          supplyId: s.supplyId,
          quantity: s.quantity
        }))
      };

      const result = await firstValueFrom(
        this.modalService.open({
          title: this.translate.instant('recipes.editRecipe'),
          contentComponent: CreateAndEditRecipeComponent,
          schema: this.formSchema,
          initialData: initialRecipeData,
          mode: 'edit'
        }).afterClosed()
      );

      if (!result) return;

      const { supplies: newSupplies, ...recipeData } = result;
      const payload = {
        name: recipeData.name,
        description: recipeData.description,
        imageUrl: recipeData.imageUrl,
        price: recipeData.price,
        userId: recipe.userId
      };

      await firstValueFrom(this.recipeService.update(recipe.id, payload as any));
      await this.recipeSupplyService.replaceSupplies(recipe.id, newSupplies || []);
      await this.loadRecipes();

    } catch (error) {
      console.error('Error editing recipe:', error);
    }
  }

  openDeleteDialog(recipe: any): void {
    this.modalService.open({
      title: this.translate.instant('shared.deleteTitle'),
      contentComponent: DeleteComponent,
      width: '25rem',
      label: 'delete ' + recipe.name
    }).afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        try {
          await firstValueFrom(this.recipeService.delete(recipe.id));
          await this.loadRecipes();
        } catch (error) {
          console.error('Error deleting recipe:', error);
        }
      }
    });
  }

  closeForm() {
    this.formVisible = false;
  }
}