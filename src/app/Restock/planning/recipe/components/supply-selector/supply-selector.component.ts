import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import {SupplyService} from '../../../../resource/inventory/services/supply.service';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  selector: 'app-supply-selector',
  standalone: true,
  templateUrl: './supply-selector.component.html',
  styleUrls: ['./supply-selector.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    TranslatePipe
  ]
})
export class SupplySelectorComponent implements OnInit {
  @Input() supplies: any[] = [];
  @Output() suppliesChange = new EventEmitter<any[]>();

  availableSupplies: any[] = [];
  selectedSupply: any = null;
  selectedQuantity: number | null = null;

  displayedColumns: string[] = ['supplyId', 'description', 'quantity', 'actions'];

  constructor(private supplyService: SupplyService) {}

  ngOnInit(): void {
    this.supplyService.getAll().subscribe((supplies) => {
      this.availableSupplies = supplies;
    });
  }

  get internalValue(): any[] {
    return this.supplies;
  }


  addSupply() {
    const exists = this.supplies.some(s => s.supplyId === this.selectedSupply.id);
    if (!exists) {
      this.supplies = [
        ...this.supplies,
        {
          supplyId: this.selectedSupply.id,
          quantity: this.selectedQuantity
        }
      ];
      this.suppliesChange.emit(this.supplies);
    }
    this.selectedSupply = null;
    this.selectedQuantity = null;
  }

  removeSupply(index: number) {
    const updated = [...this.supplies];
    updated.splice(index, 1);
    this.supplies = updated;
    this.suppliesChange.emit(this.supplies);
  }

  getSupplyName(id: number): string {
    const match = this.availableSupplies.find(s => s.id === id);
    return match ? (match as any).name : 'Unknown';
  }
}
