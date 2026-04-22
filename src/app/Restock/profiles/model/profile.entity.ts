import {Business} from './business.entity';
import {User} from '../../iam/model/user.entity';

export class Profile {
  id: number;
  name: string;
  last_name: string;
  email: string;
  avatar: string;
  phone: string;
  address: string;
  country: string;
  business_id: number;
  user_id: number;
  business?: Business;
  user?: User;

  constructor(data: Partial<Profile> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.last_name = data.last_name || '';
    this.email = data.email || '';
    this.avatar = data.avatar || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.country = data.country || '';
    this.business_id = data.business_id || 0;
    this.user_id = data.user_id || 0;
    this.business = data.business;
    this.user = data.user;
  }
}
