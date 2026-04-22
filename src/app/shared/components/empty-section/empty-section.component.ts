import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-section',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './empty-section.component.html',
  styleUrls: ['./empty-section.component.css']
})
export class EmptySectionComponent {}
