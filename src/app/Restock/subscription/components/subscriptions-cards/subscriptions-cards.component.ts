import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from '../../model/subscription.entity';

@Component({
  selector: 'app-subscriptions-cards',
  imports: [
    MatCardModule,
    MatButtonModule,
    NgClass,     // ngClass para expresiones condicionales.
    MatIconModule,
  ],
  templateUrl: './subscriptions-cards.component.html',
  styleUrl: './subscriptions-cards.component.css'
})
export class SubscriptionsCardsComponent {

  @Input() subscriptions: Array<Subscription> = [];


}
