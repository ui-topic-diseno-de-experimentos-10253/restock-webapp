import { Component } from '@angular/core';
import { SubscriptionsCardsComponent } from '../../components/subscriptions-cards/subscriptions-cards.component';
import { Subscription } from '../../model/subscription.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-overview',
  imports: [
    SubscriptionsCardsComponent,
    TranslatePipe
  ],
  templateUrl: './subscription-overview.component.html',
  styleUrl: './subscription-overview.component.css'
})
export class SubscriptionOverviewComponent {

  // Planes estáticos hardcodeados (Básico, Pro, Premium)
  subscriptions: Array<Subscription> = [
    {
      id: 1,
      name: 'Básico',
      price: 29.99,
      duration: 1,
      status: true,
      popular: false,
      features: [
        'Gestión de inventario básica',
        'Hasta 100 productos',
        'Reportes simples',
        'Soporte por email'
      ],
      rol_id: '2'
    },
    {
      id: 2,
      name: 'Pro',
      price: 79.99,
      duration: 1,
      status: true,
      popular: true,
      features: [
        'Gestión de inventario avanzada',
        'Productos ilimitados',
        'Reportes detallados',
        'Integración con proveedores',
        'Soporte prioritario',
        'Análisis de ventas'
      ],
      rol_id: '2'
    },
    {
      id: 3,
      name: 'Premium',
      price: 149.99,
      duration: 1,
      status: true,
      popular: false,
      features: [
        'Todo en Plan Pro',
        'Gestión multi-sucursal',
        'API completa',
        'Personalización avanzada',
        'Soporte 24/7',
        'Capacitación incluida',
        'Análisis predictivo'
      ],
      rol_id: '2'
    }
  ];

}
