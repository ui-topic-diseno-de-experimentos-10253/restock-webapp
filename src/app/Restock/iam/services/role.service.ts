import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role } from '../model/role.entity';
import { RoleAssembler } from './role.assembler';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseService<any> {
  private rolesRequest?: Promise<Role[]>;
  constructor() {
    super();
    this.resourceEndpoint = '/roles';
  }

  async getAllRoles(): Promise<Role[]> {
    if (!this.rolesRequest) {
      this.rolesRequest = firstValueFrom(super.getAll())
        .then(raw => raw.map((dto: any) => RoleAssembler.toEntity(dto)))
        .catch(error => { this.rolesRequest = undefined; throw error; });
    }
    return this.rolesRequest;
  }
}
