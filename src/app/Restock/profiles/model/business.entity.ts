export class Business {
  id: number;
  name: string;
  address: string;
  categories: string;
  email: string;
  phone: string;

  constructor(data: Partial<Business> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone ||'';
    this.address = data.address || '';
    this.categories = data.categories || '';
  }
}
