import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sale-confirmation',
  imports: [
    MatIconModule,    // Imports the Angular Material icon module
    MatButtonModule,   // Imports the Angular Material button module
    TranslatePipe
  ],
  templateUrl: './sale-confirmation.component.html',
  styleUrl: './sale-confirmation.component.css'
})
export class SaleConfirmationComponent {

  // Emits an event to the parent component to close the confirmation modal
  @Output() close = new EventEmitter<void>();

  // Function that emits the close event when the user clicks the close button
  closeComponente() {
    this.close.emit();
  }
}
