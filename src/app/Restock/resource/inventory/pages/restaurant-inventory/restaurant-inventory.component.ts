import {Component, OnInit, signal} from '@angular/core';
import {Supply} from '../../model/supply.entity';
import {Category} from '../../model/category.entity';
import {FormFieldSchema} from '../../../../../shared/components/create-and-edit-form/create-and-edit-form.component';
import {SupplyService} from '../../services/supply.service';
import {CategoryService} from '../../services/category.service';
import {SupplyCarouselComponent} from '../../components/supply-carousel/supply-carousel.component';
import {SupplySectionComponent} from '../../components/supply-section/supply-section.component';
import {InventoryTableComponent} from '../../components/inventory-table/inventory-table.component';
import {DeleteComponent} from '../../../../../shared/components/delete/delete.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BaseModalService} from '../../../../../shared/services/base-modal.service';
import {Batch} from '../../model/batch.entity';
import {BatchService} from '../../services/batch.service';
import {AddBatchToInventoryComponent} from '../../components/add-batch-to-inventory/add-batch-to-inventory.component';
import {TranslateService} from '@ngx-translate/core';
import {CustomSupplyService} from '../../services/custom-supply.service';
import {CreateCustomSupplyComponent} from '../../components/create-custom-supply/create-custom-supply.component';
import {SessionService} from '../../../../../shared/services/session.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-restaurant-inventory',
  standalone: true,
  templateUrl: './restaurant-inventory.component.html',
  imports: [
    SupplyCarouselComponent,
    SupplySectionComponent,
    InventoryTableComponent,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./restaurant-inventory.component.css']
})
export class RestaurantInventoryComponent implements OnInit {
  supplies: Supply[] = [];
  categories: string[] = [];
  batches: Batch[] = [];

  formSchema: FormFieldSchema[] = [];
  private editSchema: FormFieldSchema[] = [];
  isLoading = signal(false);

  constructor(
    private supplyService: SupplyService,
    private batchService: BatchService,
    private snackBar: MatSnackBar,
    private modalService: BaseModalService,
    private translate: TranslateService,
    private customSupplyService: CustomSupplyService,
    private sessionService: SessionService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.buildFormSchema();
    await this.loadData();
    console.log(this.supplies)
  }

  buildFormSchema(): void {
    const categoryOptions = this.categories.map(c => ({
      value: c,
      label: c
    }));

    this.formSchema = [
      {
        name: 'name',
        label: this.translate.instant('inventory.name'),
        type: 'text',
        placeholder: this.translate.instant('inventory.name'),
        step: 1
      },
      {
        name: 'description',
        label: this.translate.instant('inventory.descriptionOptional'),
        type: 'text',
        placeholder: this.translate.instant('inventory.descriptionOptional'),
        step: 1
      },
      {
        name: 'perishable',
        label: this.translate.instant('inventory.perishable'),
        type: 'boolean',
        placeholder: '',
        step: 1
      },
      { name: 'min_stock', label: 'Min. Stock', type: 'number', placeholder: 'e.g. 10', step: 2 },
      { name: 'max_stock', label: 'Max. Stock', type: 'number', placeholder: 'e.g. 100', step: 2 },
      { name: 'price', label: this.translate.instant('inventory.unitPrice'), type: 'number', placeholder: 'e.g. 4.90', format: 'currency', step: 2 },
      {
        name: 'category',
        label: this.translate.instant('inventory.category'),
        type: 'select',
        placeholder: 'Choose category',
        options: categoryOptions,
        step: 3
      }
    ];

    this.editSchema = this.formSchema.filter(f =>
      ['description', 'min_stock', 'max_stock', 'price'].includes(f.name)
    );
  }

  buildInventoryFormSchema(selectedSupplyId?: number): FormFieldSchema[] {
    const supplyOptions = this.supplies.map(s => ({
      value: s.id,
      label: s.name
    }));

    const schema: FormFieldSchema[] = [
      {
        name: 'supplyId',
        label: this.translate.instant('inventory.supply'),
        type: 'select',
        placeholder: this.translate.instant('inventory.supply'),
        options: supplyOptions
      },
      {
        name: 'stock',
        label: 'Stock',
        type: 'number',
        placeholder: 'Stock'
      }
    ];

    if (selectedSupplyId) {
      const selected = this.supplies.find(s => s.id === selectedSupplyId);
      if (selected?.perishable) {
        schema.push({
          name: 'expiration_date',
          label: this.translate.instant('inventory.expirationDate'),
          type: 'date',
          placeholder: this.translate.instant('inventory.expirationDate')
        });
      }
    }

    return schema;
  }

  private ensureBatchExpirationDate(result: any): any {
    if (result?.expiration_date) {
      const expiration = new Date(result.expiration_date);
      if (!Number.isNaN(expiration.getTime())) {
        return { ...result, expiration_date: expiration.toISOString().split('T')[0] };
      }
    }

    // Backend batches endpoint requires expirationDate in all cases.
    const today = new Date().toISOString().split('T')[0];
    return { ...result, expiration_date: today };
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.supplies = await this.customSupplyService.getAll();
      this.batches = await this.batchService.getAllBatchesWithSupplies();
    } catch (e) {
      console.error(e);
      this.snackBar.open('Error loading inventory data', 'Close', {duration: 3000});
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreateModal(): void {
    this.modalService.open({
      title: this.translate.instant('inventory.createSupply'),
      contentComponent: CreateCustomSupplyComponent
    }).afterClosed().subscribe(async result => {
      if (result) {
        await this.loadData();
        this.snackBar.open('Supply created', 'Close', {duration: 3000});
      }
    });
  }

  editSupply(supply: Supply): void {
    this.modalService.open({
      title: this.translate.instant('inventory.editSupply'),
      contentComponent: CreateCustomSupplyComponent,
      initialData: {...supply},
      mode: 'edit'
    }).afterClosed().subscribe(async result => {
      if (result) {
        await this.loadData();
        this.snackBar.open('Supply updated', 'Close', {duration: 3000});
      }
    });
  }

  deleteSupply(supply: Supply): void {
    this.modalService.open({
      title: 'Confirm deletion',
      contentComponent: DeleteComponent,
      width: '25rem',
      label: supply.name
    }).afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        try {
          this.isLoading.set(true);
          await this.customSupplyService.delete(supply.id);
          await this.loadData();
          this.snackBar.open('Supply deleted', 'Close', {duration: 3000});
        } catch (e) {
          console.error(e);
          this.snackBar.open('Error deleting supply', 'Close', {duration: 3000});
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }

  editBatch(batch: Batch): void {
    const initialBatchData = {
      id: batch.id,
      supplyId: batch.customSupplyId,
      stock: batch.stock,
      expiration_date: batch.expiration_date,
      user_id: batch.user_id
    };


    const dialogRef = this.modalService.open({
      title: this.translate.instant('inventory.editSupplyTitle'),
      contentComponent: AddBatchToInventoryComponent,
      schema: this.buildInventoryFormSchema(batch.customSupplyId),
      initialData: initialBatchData,
      mode: 'edit',
      injectorValues: {
        supplies: this.supplies
      }
    });

    const instance = dialogRef.componentInstance.contentComponentRef?.instance as AddBatchToInventoryComponent | undefined;
    instance?.supplyChange.subscribe((supplyId: number) => {
      instance.baseSchema = this.buildInventoryFormSchema(supplyId);
      instance.updateSchema();
    });

    dialogRef.afterOpened().subscribe(() => {
      instance?.supplyChange.subscribe((supplyId: number) => {
        instance.baseSchema = this.buildInventoryFormSchema(supplyId);
        instance.updateSchema();
      })
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          this.isLoading.set(true);
          const userId = this.sessionService.getUserId() ?? 0;
          const normalizedResult = this.ensureBatchExpirationDate(result);
          const updated = Batch.fromForm(normalizedResult, userId);
          await this.batchService.update(batch.id, updated);
          await this.loadData();
          this.snackBar.open('Batch updated', 'Close', {duration: 3000});
        } catch (e) {
          console.error(e);
          this.snackBar.open('Error updating batch', 'Close', {duration: 3000});
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }

  deleteBatch(batch: Batch): void {
    const dialogRef = this.modalService.open({
        title: this.translate.instant('shared.deleteTitle'),
        contentComponent: DeleteComponent,
        width: '25rem',
        label: batch.supply?.name
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        try {
          this.isLoading.set(true);
          await this.batchService.delete(batch.id);
          await this.loadData();
          this.snackBar.open('Batch deleted', 'Close', {duration: 3000});
        } catch (e) {
          console.error(e);
          this.snackBar.open('Error deleting batch', 'Close', {duration: 3000});
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }


  openAddSupplyToInventory(): void {
    const dialogRef = this.modalService.open({
      title: this.translate.instant('inventory.addInventoryTitle'),
      contentComponent: AddBatchToInventoryComponent,
      schema: this.buildInventoryFormSchema(),
      initialData: {},
      mode: 'create',
      injectorValues: {
        supplies: this.supplies
      }
    });

    const instance = dialogRef.componentInstance.contentComponentRef?.instance as AddBatchToInventoryComponent | undefined;
    instance?.supplyChange.subscribe((supplyId: number) => {
      instance.baseSchema = this.buildInventoryFormSchema(supplyId);
      instance.updateSchema();
    });

    dialogRef.afterOpened().subscribe(() => {
      const instance = dialogRef.componentInstance
        .contentComponentRef?.instance as
        AddBatchToInventoryComponent | undefined;
      instance?.supplyChange.subscribe((supplyId: number) => {
        instance.baseSchema = this.buildInventoryFormSchema(supplyId);
        instance.updateSchema();
      });
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const selectedSupply = this.supplies.find(s => Number(s.id) === Number(result.supplyId));

        if (!selectedSupply) {
          this.snackBar.open('Supply not found', 'Close', {duration: 3000});
          return;
        }

        if (selectedSupply.perishable && !result.expiration_date) {
          this.snackBar.open('Expiration date is required for perishable items', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error'
          });
          return;
        }

        try {
          this.isLoading.set(true);
          const userId = this.sessionService.getUserId() ?? 0;
          const normalizedResult = this.ensureBatchExpirationDate(result);
          const batch = Batch.fromForm(normalizedResult, userId);
          await this.batchService.create(batch);

          this.snackBar.open('Batch registered', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-success'
          });

          await this.loadData();
        } catch (e) {
          console.error(e);
          const err: any = e;
          const details = typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? JSON.stringify(err?.error ?? {}));
          this.snackBar.open(`Error registering batch (${err?.status ?? 'unknown'}): ${details}`, 'Close', {duration: 6000});
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }
}
