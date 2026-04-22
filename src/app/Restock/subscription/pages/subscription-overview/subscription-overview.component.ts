import { Component, inject } from '@angular/core';
import { SubscriptionService } from '../../services/subscription.service';
import { mockUser } from '../../../../shared/mocks/user.mock';
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

  subscriptions: Array<Subscription> = [];

  //fake api
  private subscriptionApi: SubscriptionService = inject(SubscriptionService);

  user = mockUser;

  ngOnInit(): void {

    // // Continuar con lógica normal si todo está bien
    // this.subscriptionApi.getAll().subscribe(subs => this.subscriptions = subs);
    //aca se valida porque no hay backend aun, esto deberia estar en backend
    this.subscriptionApi.getAll().subscribe(subs => {
      console.log("subs: ", subs);
      this.subscriptions = subs.filter(
        s => s.rol_id === String(this.user.role_id.id)
      );
      console.log("subscriptions:", this.subscriptions);
    });
  }

}
