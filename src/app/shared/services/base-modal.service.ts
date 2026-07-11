import { inject, Injectable, Injector } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BaseModalComponent } from '../components/base-modal/base-modal.component';

@Injectable({
  providedIn: 'root'
})
export class BaseModalService {
  private readonly dialog = inject(MatDialog);
  private readonly parentInjector = inject(Injector);

  open(config: {
    title: string;
    contentComponent: any;
    description?: string;
    schema?: any;
    initialData?: any;
    label?: any;
    mode?: 'create' | 'edit';
    width?: string;
    height?: string;
    injectorValues?: Record<string, any>;
  }): MatDialogRef<BaseModalComponent> {
    const dialogConfig: MatDialogConfig = {
      disableClose: false,
      closeOnNavigation: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      width: config.width || 'min(42rem, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 24px)',
      height: config.height || 'auto',
      maxHeight: 'min(90dvh, 920px)',
      panelClass: ['dialog-unified-size', 'rs-dialog-panel'],
      data: {
        title: config.title,
        contentComponent: config.contentComponent,
        schema: config.schema,
        description: config.description,
        initialData: config.initialData,
        label: config.label,
        mode: config.mode
      }
    };

    if (config.injectorValues && Object.keys(config.injectorValues).length > 0) {
      const providers = Object.entries(config.injectorValues).map(([key, value]) => ({
        provide: key,
        useValue: value
      }));

      dialogConfig.injector = Injector.create({
        providers,
        parent: this.parentInjector
      });
    }

    return this.dialog.open(BaseModalComponent, dialogConfig);
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}
