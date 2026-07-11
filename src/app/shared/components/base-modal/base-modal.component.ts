import { AfterViewInit, Component, ComponentRef, Inject, Injector, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.css'],
  imports: [CommonModule, MatIconModule, MatIconButton, MatButtonModule, TranslateModule]
})
export class BaseModalComponent implements AfterViewInit {
  injectorInstance: Injector;

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
      label?: any;
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
