import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role } from '../model/role.entity';
import { RoleAssembler } from './role.assembler';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseService<any> {
  constructor() {
    super();
    this.resourceEndpoint = '/roles';
  }

  async getAllRoles(): Promise<Role[]> {
    const raw = await firstValueFrom(super.getAll());
    return raw.map((dto: any) => RoleAssembler.toEntity(dto));
  }
}
