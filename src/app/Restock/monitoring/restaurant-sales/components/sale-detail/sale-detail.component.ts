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
        TranslatePipe,
    ],
    templateUrl: './sale-detail.component.html',
    styleUrl: './sale-detail.component.css'
})
export class SaleDetailComponent implements OnInit {
    @Output() close = new EventEmitter<void>();

    /**
     * Accepts both the raw API shape (dishSelections / supplySelections)
     * and the enriched shape produced by the parent (dishes / additionalSupplies).
     */
    @Input() sale: any;

    closeComponent(): void {
        this.close.emit();
    }

    displayedColumnsPlatos: string[] = ['name', 'price', 'quantity'];
    displayedColumnsInsumos: string[] = ['name', 'price', 'quantity'];

    dishes = new MatTableDataSource<any>([]);
    additionalSupplies = new MatTableDataSource<any>([]);

    ngOnInit(): void {
        // Support both enriched shape (dishes[]) and raw API shape (dishSelections[])
        if (this.sale?.dishes) {
            this.dishes.data = this.sale.dishes;
        } else if (this.sale?.dishSelections) {
            this.dishes.data = this.sale.dishSelections.map((ds: any) => ({
                name: `Dish #${ds.dishId}`,
                unitPrice: ds.unitPrice,
                quantity: ds.quantity
            }));
        }

        if (this.sale?.additionalSupplies) {
            this.additionalSupplies.data = this.sale.additionalSupplies;
        } else if (this.sale?.supplySelections) {
            this.additionalSupplies.data = this.sale.supplySelections.map((ss: any) => ({
                name: `Supply #${ss.supplyId}`,
                unitPrice: ss.unitPrice,
                quantity: ss.quantity
            }));
        }
    }
}