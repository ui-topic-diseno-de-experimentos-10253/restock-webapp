import {Component, Inject, OnInit, Optional, signal} from '@angular/core';
import {CatalogSupplyService} from '../../services/catalog-supply.service';
import {MatDialogRef} from '@angular/material/dialog';
import {CustomSupplyService} from '../../services/custom-supply.service';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import { MatInputModule, MatLabel} from '@angular/material/input';
import {SessionService} from '../../../../../shared/services/session.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Supply} from '../../model/supply.entity';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CreateCustomSupplyRequest} from '../../services/custom-supply.contract';

@Component({
  selector: 'app-create-custom-supply',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    MatButton,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-custom-supply.component.html',
  styleUrl: './create-custom-supply.component.css'
})
export class CreateCustomSupplyComponent implements OnInit {
  readonly unitOptions = [
    { unitName: 'Kilogram', unitAbbreviaton: 'kg', label: 'Kilogram (kg)' },
    { unitName: 'Gram', unitAbbreviaton: 'g', label: 'Gram (g)' },
    { unitName: 'Liter', unitAbbreviaton: 'l', label: 'Liter (l)' },
    { unitName: 'Milliliter', unitAbbreviaton: 'ml', label: 'Milliliter (ml)' },
    { unitName: 'Unit', unitAbbreviaton: 'unit', label: 'Unit (unit)' }
  ];

  supplies: any[] = [];
  selectedId: string | number | null = null;
  selectedSupply: any = null;
  minStock: number | null = null;
  maxStock: number | null = null;
  unitPrice: number | null = null;
  description: string | null = null;
  unitName: string | null = null;
  unitAbbreviaton: string | null = null; // typo intencional del backend
  selectedUnitOption: string | null = null;

  isLoading = signal(false);

  constructor(
    private catalog: CatalogSupplyService,
    private custom: CustomSupplyService,
    private dialogRef: MatDialogRef<CreateCustomSupplyComponent>,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    @Optional() @Inject('initialData') private initialData?: Supply,
    @Optional() @Inject('mode') public mode: 'create' | 'edit' | null = 'create'
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.supplies = await this.catalog.getCatalogSupplies();
    console.log("Available supplies:", this.supplies);

    if (this.mode === 'edit' && this.initialData) {
      this.selectedId = this.initialData.supplyId;
      this.selectedSupply = this.supplies.find(supply => supply.id == this.selectedId);
      this.description = this.initialData.description ?? null;
      this.minStock = this.initialData.min_stock ?? null;
      this.maxStock = this.initialData.max_stock ?? null;
      this.unitPrice = this.initialData.price ?? null;
      this.unitName = (this.initialData as any).unitName ?? null;
      this.unitAbbreviaton = (this.initialData as any).unitAbbreviaton ?? null;
      if (this.unitName && this.unitAbbreviaton) {
        this.selectedUnitOption = `${this.unitName}|${this.unitAbbreviaton}`;
      }
    }
  }

  onSupplyChange(id: string | number): void {
    this.selectedSupply = this.supplies.find(supply => supply.id == id);
  }

  onUnitChange(value: string): void {
    const [unitName, unitAbbreviaton] = value.split('|');
    this.unitName = unitName ?? '';
    this.unitAbbreviaton = unitAbbreviaton ?? '';
  }

  save(): void {
    if (!this.selectedSupply) {
      return;
    }

    const userId = this.sessionService.getUserId(); // Obtener el userId desde el SessionService
    if (userId === null) {
      console.error('User ID not found in session.');
      this.snackBar.open('No userId in session (please sign in again)', 'Close', {duration: 4000});
      return;
    }

    const supplyId = Number(this.selectedSupply.id);
    if (Number.isNaN(supplyId)) {
      this.snackBar.open('Invalid supplyId selected', 'Close', {duration: 3000});
      return;
    }

    const unitAbbrev = (this.unitAbbreviaton ?? '').trim();
    const unitName = (this.unitName ?? '').trim();

    if (!unitName || !unitAbbrev) {
      this.snackBar.open('Unit name and abbreviation are required', 'Close', {duration: 4000});
      return;
    }

    const payload: CreateCustomSupplyRequest = {
      supplyId,
      description: this.description ?? '',
      minStock: this.minStock ?? 0,
      maxStock: this.maxStock ?? 0,
      price: this.unitPrice ?? 0,
      userId,
      unitName: String(unitName),
      unitAbbreviaton: String(unitAbbrev), // typo intencional
    };

    console.log('[CustomSupply] create/update payload', payload);

    this.isLoading.set(true);
    const request$ = (this.mode === 'edit' && this.initialData?.id != null)
      ? this.custom.update(Number(this.initialData.id), payload)
      : this.custom.create(payload);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error creating custom supply:', err);
        console.error('Status:', err?.status);
        console.error('Message:', err?.error);
        const details = typeof err?.error === 'string'
          ? err.error
          : (err?.error?.message ?? JSON.stringify(err?.error ?? {}));
        this.snackBar.open(`Error saving supply (${err?.status ?? 'unknown'}): ${details}`, 'Close', {duration: 6000});
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
