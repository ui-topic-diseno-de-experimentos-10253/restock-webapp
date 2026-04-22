import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-supplier-calendar-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Select custom range</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 16px;">
      <mat-form-field appearance="outline">
        <mat-label>From</mat-label>
        <input matInput [matDatepicker]="pickerFrom" [formControl]="fromCtrl">
        <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
        <mat-datepicker #pickerFrom></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>To</mat-label>
        <input matInput [matDatepicker]="pickerTo" [formControl]="toCtrl">
        <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
        <mat-datepicker #pickerTo></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="primary" (click)="apply()">Apply</button>
    </mat-dialog-actions>
  `
})
export class SupplierCalendarDialogComponent {
  fromCtrl = new FormControl<Date | null>(this.data?.selectedRange?.[0] ?? null);
  toCtrl = new FormControl<Date | null>(this.data?.selectedRange?.[1] ?? null);

  constructor(
    public dialogRef: MatDialogRef<SupplierCalendarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedRange: Date[] }
  ) {}

  apply(): void {
    const from = this.fromCtrl.value;
    const to = this.toCtrl.value;

    if (from && to && from <= to) {
      this.dialogRef.close([from, to]);
    }
  }
}
