import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { MatDivider } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sale-detail',
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
    MatDivider,
    TranslatePipe
  ],
  templateUrl: './sale-detail.component.html',
  styleUrl: './sale-detail.component.css'
})
export class SaleDetailComponent implements OnInit {
  @Output() close = new EventEmitter<void>(); // Emits when modal should be closed
  @Input() sale: any;

  // Closes the component (used by close or cancel buttons)
  closeComponent() {
    this.close.emit();
  }

  // Table column definitions
  displayedColumnsPlatos: string[] = ['name', 'price', 'quantity'];
  displayedColumnsInsumos: string[] = ['name', 'price', 'quantity'];

  dishes = new MatTableDataSource<any>([]);
  additionalSupplies = new MatTableDataSource<any>([]);

  ngOnInit() {
    this.dishes.data = this.sale.dishes || [];
    this.additionalSupplies.data = this.sale.additionalSupplies || [];
  }


}

