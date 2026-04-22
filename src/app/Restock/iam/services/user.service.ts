import { Injectable, inject } from '@angular/core';
import { User } from '../model/user.entity';
import { UserAssembler } from './user.assembler';
import { RoleService } from './role.service';
import { firstValueFrom } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService<User> {
    private readonly roleService = inject(RoleService);

    constructor() {
        super();
        this.resourceEndpoint = '/users';
    }

    async getAllEnriched(): Promise<User[]> {
        const [rawUsers, roles] = await Promise.all([
            firstValueFrom(this.getAll()),
            this.roleService.getAllRoles()
        ]);

        return rawUsers.map(raw => {
            const role = roles.find(r => r.id === raw.role_id);
            return UserAssembler.toEntity(raw, role);
        });
    }

    async getUserById(id: number): Promise<User> {
        const raw = await firstValueFrom(this.getById(id));
        const role = await this.roleService.getAllRoles().then(rs => rs.find(r => r.id === raw.role_id));
        return UserAssembler.toEntity(raw, role);
    }

    async getSupplierUserIds(): Promise<number[]> {
        const rawUsers = await firstValueFrom(this.getAll());
        return rawUsers
            .filter(user => user.role_id === 1)
            .map(user => user.id);
    }
    async getRestaurantAdminUserIds(): Promise<number[]> {
        const rawUsers = await firstValueFrom(this.getAll());
        return rawUsers
            .filter(user => user.role_id === 2)
            .map(user => user.id);
    }
    async createUser(user: User): Promise<User> {
        const dto = UserAssembler.toDTO(user);
        const created = await firstValueFrom(this.create(dto));
        return UserAssembler.toEntity(created);
    }

    async updateUser(id: number, user: User): Promise<User> {
        const dto = UserAssembler.toDTO(user);
        const updated = await firstValueFrom(this.update(id, dto));
        return UserAssembler.toEntity(updated);
    }

    async deleteUser(id: number): Promise<void> {
        await firstValueFrom(this.delete(id));
    }
}
