import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject, Input, NgZone,
  OnInit, Optional,
  Output, Type
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {TranslatePipe} from '@ngx-translate/core';

export interface FormFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'boolean' | 'file' | 'select' | 'date' | 'custom';
  placeholder: string;
  format?: 'currency';
  options?: { value: any; label: string }[];
  step?: number;
}

@Component({
  selector: 'app-create-and-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe
  ],
  templateUrl: './create-and-edit-form.component.html',
  styleUrls: ['./create-and-edit-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for creating and editing forms.
 * This component dynamically generates a form based on the provided schema,
 * allowing users to create or edit data entries.
 */
export class CreateAndEditFormComponent implements OnInit {
  form: any = {};
  currentStep = 1;
  hasSteps = false;
  totalSteps = 1;
  /**
   * Event emitter for form submission.
   */
  @Output() submit = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<any>();
  /**
   * Schema for the form fields.
   */
  @Input() schema: FormFieldSchema[] | null = null;
  @Input() customComponents: Record<string, Type<any>> = {};
  /**
   * Initial data for the form.
   */
  @Input() initialData: any = null;
  /**
   * Mode of the form, either 'create' or 'edit'.
   */
  @Input() mode: 'create' | 'edit' | null = null;

  /**
   * Constructor for CreateAndEditFormComponent.
   * @param injectedSchema
   * @param injectedInitialData
   * @param injectedMode
   * @param cdr
   */
  constructor(
    @Optional() @Inject('schema') private injectedSchema: FormFieldSchema[] | null,
    @Optional() @Inject('initialData') private injectedInitialData: any,
    @Optional() @Inject('mode') private injectedMode: 'create' | 'edit' | null,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Lifecycle hook that is called after the component has been initialized.
   */
  ngOnInit(): void {
    if (!this.schema) {
      this.schema = this.injectedSchema ?? [];
    }

    if (this.mode === null) {
      this.mode = this.injectedMode ?? 'create';
    }

    if (this.initialData === null) {
      this.initialData = this.injectedInitialData ?? {};
    }

    this.form = {};

    if (this.initialData) {
      for (const key of Object.keys(this.initialData)) {
        const value = this.initialData[key];

        if (Array.isArray(value)) {
          this.form[key] = value.map(item => ({ ...item }));
        } else if (typeof value === 'object' && value !== null) {
          this.form[key] = { ...value };
        } else {
          this.form[key] = value;
        }
      }
    }

    this.hasSteps = this.schema.some(f => typeof f.step === 'number');
    if (this.hasSteps) {
      this.totalSteps = Math.max(...this.schema.map(f => f.step ?? 1));
    }

    this.cdr.markForCheck();
  }

  handleUpload(event: any, fieldName: string): void {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'uitopic');

    fetch('https://api.cloudinary.com/v1_1/dvspiemtu/image/upload', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        this.form[fieldName] = data.secure_url;
        this.emitChange();
        this.cdr.markForCheck();
      })
      .catch(error => console.error('❌ Upload failed:', error));
  }


  emitChange(): void {
    this.formChange.emit(this.form);
  }

  updateField(name: string, value: any): void {
    this.form[name] = value;
    this.emitChange();
  }

  handleSuppliesChange(value: any[]): void {
    this.updateField('supplies', value);
  }

  fieldsForCurrentStep(): FormFieldSchema[] {
    if (!this.hasSteps) {
      return this.schema ?? [];
    }
    return (this.schema ?? []).filter(f => (f.step ?? 1) === this.currentStep);
  }

  validateCurrentStep(): boolean {
    if (!this.hasSteps) {
      return true;
    }
    return this.fieldsForCurrentStep().every(field => {
      const value = this.form[field.name];
      return value !== undefined && value !== null && value !== '';
    });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    this.submit.emit(this.form);
  }
}
