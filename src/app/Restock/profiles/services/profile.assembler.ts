import { Profile } from '../model/profile.entity';

export class ProfileAssembler {

  static toEntity( dto: any ): Profile {
    return new Profile({
      id: dto.id,
      name: dto.name,
      last_name: dto.last_name,
      email: dto.email,
      avatar: dto.avatar,
      phone: dto.phone,
      address: dto.address,
      country: dto.country,
      business_id: dto.business_id,
      user_id: dto.user_id,
      business: dto.business,
      user: dto.user
    });
  }

  static toDTO(entity: Profile): any {
    return {
      id: entity.id,
      name: entity.name,
      last_name: entity.last_name,
      email: entity.email,
      avatar: entity.avatar,
      phone: entity.phone,
      address: entity.address,
      country: entity.country,
      business_id: entity.business_id,
      user_id: entity.user_id,
      business: entity.business,
      user: entity.user
    };
  }

}
