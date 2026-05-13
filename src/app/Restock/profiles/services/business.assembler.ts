 import {Business} from '../model/business.entity';

export class BusinessAssembler {

  static toEntity( dto: any ): Business {
    return new Business({
      id: dto.id,
      name: dto.name,
      address: dto.address,
      categories: dto.categories,
      email: dto.email,
      phone: dto.phone
    });
  }

  static toDTO(entity: Business): any {
    return {
      id: entity.id,
      name: entity.name,
      address: entity.address,
      categories: entity.categories,
      email: entity.email,
      phone: entity.phone
    };
  }

}
