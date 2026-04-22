import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {
  CreateAndEditFormComponent, FormFieldSchema
} from '../../../../../shared/components/create-and-edit-form/create-and-edit-form.component';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {Supply} from '../../model/supply.entity';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-batch-to-inventory',
  standalone: true,
  templateUrl: './add-batch-to-inventory.component.html',
  imports: [CreateAndEditFormComponent, MatButtonModule, FormsModule]
})
/**
 * Component for adding a batch to the inventory.
 * This component allows users to create or edit a batch of supplies,
 * including handling perishable items with expiration dates.
 */
export class AddBatchToInventoryComponent implements OnInit {
  form: any = {};
  supplies: Supply[] = [];
  currentSchema: FormFieldSchema[] = [];

  @Output() supplyChange = new EventEmitter<number>();


  /**
   * Constructor for AddBatchToInventoryComponent.
   * @param dialogRef
   * @param baseSchema
   * @param initialData
   * @param mode
   * @param injectedSupplies
   */
  constructor(
    private dialogRef: MatDialogRef<AddBatchToInventoryComponent>,
    @Inject('schema') public baseSchema: FormFieldSchema[],
    @Inject('initialData') public initialData: any,
    @Inject('mode') public mode: 'create' | 'edit',
    @Inject('supplies') public injectedSupplies: Supply[]
  ) {}

  ngOnInit(): void {
    this.form = { ...this.initialData };
    this.supplies = this.injectedSupplies;
    this.updateSchema();
  }

  /**
   * Handles changes in the form data.
   * This method is called when the form is updated,
   * allowing the component to react to changes
   * @param updatedForm
   */
  handleFormChange(updatedForm: any): void {
    this.form = updatedForm;
    this.updateSchema();
    this.supplyChange.emit(this.form.supplyId);
  }

  onSubmit(result: any): void {
      this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Updates the form schema based on the selected supply.
   * If the selected supply is not perishable,
   * the expiration_date field is removed from the schema.
   */
  updateSchema(): void {
    const selected = this.supplies.find(s => s.id === this.form.supplyId);
    if (selected && !selected.perishable) {
      this.currentSchema = this.baseSchema.filter(f => f.name !== 'expiration_date');
    } else {
      this.currentSchema = [...this.baseSchema];
    }
  }
}

