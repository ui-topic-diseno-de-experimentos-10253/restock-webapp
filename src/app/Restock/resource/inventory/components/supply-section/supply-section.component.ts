import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {EmptySectionComponent} from '../../../../../shared/components/empty-section/empty-section.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-supplier-supply-section',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, EmptySectionComponent, MatCardModule, TranslatePipe],
  templateUrl: './supply-section.component.html',
  styleUrls: ['./supply-section.component.css']
})
export class SupplySectionComponent {
  @Input() suppliesLength: number = 0;
  @Output() create = new EventEmitter<void>();
}
