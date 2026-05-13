import {Order} from '../../Restock/resource/orders-to-suppliers/model/order.entity';

export const mockOrders: Order[] = [
  {
    id: 1,
    supplier: 'Alimentos S.A.',
    supply: 'Atún',
    quantity: 15,
    unit: 'kg',
    finalPrice: 124.5,
    situation: 'approved',
    state: 'on hold',
    shipDate: '2025-06-05'
  },
  {
    id: 2,
    supplier: 'Bebidas SRL',
    supply: 'Papa amarilla',
    quantity: 30,
    unit: 'kg',
    finalPrice: 50.3,
    situation: 'approved',
    state: 'preparing',
    shipDate: '2025-06-06'
  },
  {
    id: 3,
    supplier: 'Alimentos y Bebidas',
    supply: 'Arroz',
    quantity: 24,
    unit: 'kg',
    finalPrice: 67,
    situation: 'approved',
    state: 'on the way',
    shipDate: '2025-06-07'
  },
  {
    id: 4,
    supplier: 'Granos S.A.C.',
    supply: 'Maíz',
    quantity: 18,
    unit: 'kg',
    finalPrice: 35,
    situation: 'declined',
    state: 'on hold',
    shipDate: '2025-06-05'
  }
];
