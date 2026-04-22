export class Subscription {
    id: number;
    name: string;
    duration: number;
    price: number;
    status: boolean;
    popular: boolean;
    features: [];
    rol_id: string;


    //El signo de interrogación (?) en TypeScript indica que una propiedad es opcional. En tu clase:
    constructor(subscription: {
        id?: number,
        name?: string,
        duration?: number,
        price?: number,
        status?: boolean,
        popular?: boolean,
        features?: [],
        rol_id?: string,
    }) {
        this.id = subscription.id || 0;
        this.name = subscription.name || '';
        this.duration = subscription.duration || 0;
        this.price = subscription.price || 0;
        this.status = subscription.status ?? false;
        this.popular = subscription.popular ?? false;
        this.features = subscription.features || [];
        this.rol_id = subscription.rol_id || '';

    }
}
