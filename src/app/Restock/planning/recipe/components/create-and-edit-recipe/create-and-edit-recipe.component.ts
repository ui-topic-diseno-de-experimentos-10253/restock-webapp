import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {
  CreateAndEditFormComponent,
  FormFieldSchema
} from '../../../../../shared/components/create-and-edit-form/create-and-edit-form.component';
import {SupplySelectorComponent} from '../supply-selector/supply-selector.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-create-and-edit-recipe',
  imports: [
    CreateAndEditFormComponent,
    FormsModule
  ],
  templateUrl: './create-and-edit-recipe.component.html',
  styleUrl: './create-and-edit-recipe.component.css'
})
export class CreateAndEditRecipeComponent implements OnInit {
  form: any = {};
  supplies: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateAndEditRecipeComponent>,
    @Inject('schema') public schema: FormFieldSchema[],
    @Inject('initialData') public initialData: any,
    @Inject('mode') public mode: 'create' | 'edit'
  ) {}

  ngOnInit(): void {
    if (this.initialData) {
      const { supplies = [], ...rest } = this.initialData;
      this.supplies = supplies.map((s: any) => ({ ...s }));
      this.form = { ...rest, supplies: this.supplies };

    }
  }

  handleFormChange(updatedForm: any): void {
    this.form = updatedForm;
    if (updatedForm?.supplies) {
      this.supplies = [...updatedForm.supplies];
    }
  }

  handleSuppliesChange(updatedSupplies: any[]): void {
    this.supplies = updatedSupplies;
    this.form.supplies = updatedSupplies;
  }

  onSubmit(result: any): void {
    this.dialogRef.close({
      ...result,
      supplies: this.supplies
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  protected readonly SupplySelectorComponent = SupplySelectorComponent;
}
