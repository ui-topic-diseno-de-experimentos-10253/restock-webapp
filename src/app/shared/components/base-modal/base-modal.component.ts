import {AfterViewInit, Component, ComponentRef, Inject, Injector, ViewChild, ViewContainerRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import {MatButtonModule, MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.css'],
  imports: [
    CommonModule,
    MatIconModule,
    MatIconButton,
    MatButtonModule
  ]
})
/**
 * BaseModalComponent is a generic modal component that can be used to display
 * any content component passed to it.
 * It uses Angular's ViewContainerRef to dynamically create
 * the content component inside the modal.
 */
export class BaseModalComponent implements AfterViewInit {
  /**
   * Injector instance to provide dependencies to the content component.
   */
  injectorInstance: Injector;
  /**
   * ViewContainerRef to dynamically create the content component.
   * This allows the modal to host any component
   * passed to it via the `data` property.
   */
  @ViewChild('container', { read: ViewContainerRef }) containerRef!: ViewContainerRef;
  contentComponentRef?: ComponentRef<any>;

  constructor(
    public dialogRef: MatDialogRef<BaseModalComponent>,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      contentComponent: any;
      description?: string;
      schema?: any;
      initialData?: any;
      mode?: 'create' | 'edit';
    }
  ) {
    this.injectorInstance = Injector.create({
      providers: [
        { provide: 'schema', useValue: data.schema },
        { provide: 'initialData', useValue: data.initialData },
        { provide: 'mode', useValue: data.mode }
      ],
      parent: this.injector
    });
  }

  /**
   * Lifecycle hook that is called after the view has been initialized.
   * This is where the content component is dynamically created
   * and inserted into the modal.
   */
  ngAfterViewInit(): void {
    this.contentComponentRef = this.containerRef.createComponent(
      this.data.contentComponent,
      { injector: this.injectorInstance }
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
