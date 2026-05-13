import { User } from '../model/user.entity';
import { Role } from '../model/role.entity';

export class UserAssembler {
  static toEntity(dto: any, role?: Role): User {
    return User.fromPersistence(dto, role);
  }

  static toDTO(user: User): any {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role_id: user.role_id,
      subscription_id: user.subscription_id,
      start_date: user.start_date,
      subscription_payment_details_id: user.subscription_payment_details_id
    };
  }
}
