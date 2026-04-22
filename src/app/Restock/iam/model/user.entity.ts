import { Role } from './role.entity';

export class User {
  id: number;
  email: string;
  password: string;
  role_id: number;
  subscription_id: number;
  start_date: string;
  subscription_payment_details_id: number;
  role?: Role;

  constructor(data: Partial<User> = {}) {
    this.id = data.id || 0;
    this.email = data.email || '';
    this.password = data.password || '';
    this.role_id = data.role_id || 0;
    this.subscription_id = data.subscription_id || 0;
    this.start_date = data.start_date || '';
    this.subscription_payment_details_id = data.subscription_payment_details_id || 0;
    this.role = data.role || undefined;
  }

  static fromPersistence(raw: any, role?: Role): User {
    return new User({
      id: raw.id,
      email: raw.email,
      password: raw.password,
      role_id: raw.role_id,
      subscription_id: raw.subscription_id,
      start_date: raw.start_date,
      subscription_payment_details_id: raw.subscription_payment_details_id,
      role: role
    });
  }

}
