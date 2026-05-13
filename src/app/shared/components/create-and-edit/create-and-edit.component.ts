import { Component, inject } from '@angular/core';
import { BaseModalService } from '../../services/base-modal.service';
import { CreateAndEditFormComponent, FormFieldSchema } from '../create-and-edit-form/create-and-edit-form.component';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-create-and-edit',
  standalone: true,
  template: '', // no usa template
})
export class CreateAndEditComponent {
  private modalService = inject(BaseModalService);

  // open(
  //   schema: FormFieldSchema[],
  //   initialData: any,
  //   mode: 'create' | 'edit' = 'create',
  //   title = mode === 'create' ? 'Create' : 'Edit',
  //   width = '35rem'
  // ): void {
  //   this.modalService.open({
  //       title,
  //       width,
  //       contentComponent: CreateAndEditFormComponent,
  //       contentInputs: {
  //         schema,
  //         initialData,
  //         mode
  //       }
  //
  //   });
  // }
}
