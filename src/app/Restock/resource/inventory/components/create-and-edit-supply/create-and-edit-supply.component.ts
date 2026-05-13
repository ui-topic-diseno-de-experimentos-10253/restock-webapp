import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateAndEditFormComponent, FormFieldSchema } from '../../../../../shared/components/create-and-edit-form/create-and-edit-form.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-create-and-edit-supply',
  standalone: true,
  templateUrl: './create-and-edit-supply.component.html',
  imports: [CreateAndEditFormComponent, MatButtonModule, FormsModule]
})
export class CreateAndEditSupplyComponent implements OnInit {
  form: any = {};

  constructor(
    private dialogRef: MatDialogRef<CreateAndEditSupplyComponent>,
    @Inject('schema') public schema: FormFieldSchema[],
    @Inject('initialData') public initialData: any,
    @Inject('mode') public mode: 'create' | 'edit'
  ) {}

  ngOnInit(): void {
    this.form = { ...this.initialData };
  }

  onSubmit(result: any): void {
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

