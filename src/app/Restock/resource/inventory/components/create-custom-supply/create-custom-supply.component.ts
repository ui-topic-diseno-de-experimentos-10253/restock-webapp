import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-create-custom-supply',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    MatButton,
    MatInputModule
  ],
  templateUrl: './create-custom-supply.component.html',
  styleUrl: './create-custom-supply.component.css'
})
export class CreateCustomSupplyComponent implements OnInit {
  supplies: any[] = [];
  selectedId: string | null = null;
  selectedSupply: any = null;
  minStock: number | null = null;
  maxStock: number | null = null;
  unitPrice: number | null = null;
  description: string | null = null;

  constructor(
    private catalog: CatalogSupplyService,
    private custom: CustomSupplyService,
    private dialogRef: MatDialogRef<CreateCustomSupplyComponent>,
    private sessionService: SessionService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.supplies = await this.catalog.getCatalogSupplies();
    console.log("Available supplies:", this.supplies);
  }

  onSupplyChange(id: string): void {
    this.selectedSupply = this.supplies.find(supply => supply.id === id);
  }

  async save(): Promise<void> {
    if (!this.selectedSupply) {
      return;
    }

    const userId = this.sessionService.getUserId(); // Obtener el userId desde el SessionService
    if (userId === null) {
      console.error('User ID not found in session.');
      return;
    }

    await this.custom.create({
      supplyId: this.selectedSupply.id,
      minStock: this.minStock ?? 0,
      maxStock: this.maxStock ?? 0,
      price: this.unitPrice ?? 0,
      description: this.description ?? '',
      userId: userId
    });
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
