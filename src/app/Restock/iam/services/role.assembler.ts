import { Role } from '../model/role.entity';

export class RoleAssembler {
  static toEntity(dto: any): Role {
    return Role.fromPersistence(dto);
  }

  static toDTO(role: Role): any {
    return {
      id: role.id,
      name: role.name
    };
  }
}
