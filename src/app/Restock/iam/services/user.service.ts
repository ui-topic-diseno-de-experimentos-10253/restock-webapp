import { Injectable, inject } from '@angular/core';
import { User } from '../model/user.entity';
import { UserAssembler } from './user.assembler';
import { RoleService } from './role.service';
import { firstValueFrom } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService<User> {
    private readonly roleService = inject(RoleService);
    private usersRequest?: Promise<any[]>;
    private usersCachedAt = 0;
    private readonly usersCacheTtlMs = 30_000;

    constructor() {
        super();
        this.resourceEndpoint = '/users';
    }

    async getAllEnriched(): Promise<User[]> {
        const [rawUsers, roles] = await Promise.all([
            this.getRawUsers(),
            this.roleService.getAllRoles()
        ]);

        return rawUsers.map((raw: any) => {
            const roleId = raw.role_id ?? raw.roleId;
            const role = roles.find(r => r.id === roleId);
            return UserAssembler.toEntity(raw, role);
        });
    }

    async getUserById(id: number): Promise<User> {
        const raw = await firstValueFrom(this.getById(id));
        const role = await this.roleService.getAllRoles().then(rs => rs.find(r => r.id === raw.role_id));
        return UserAssembler.toEntity(raw, role);
    }

    async getSupplierUserIds(): Promise<number[]> {
        const rawUsers = await this.getRawUsers();
        return rawUsers
            .filter((user: any) => (user.role_id ?? user.roleId) === 1)
            .map((user: any) => user.id);
    }
    async getRestaurantAdminUserIds(): Promise<number[]> {
        const rawUsers = await this.getRawUsers();
        return rawUsers
            .filter((user: any) => (user.role_id ?? user.roleId) === 2)
            .map((user: any) => user.id);
    }
    async createUser(user: User): Promise<User> {
        const dto = UserAssembler.toDTO(user);
        const created = await firstValueFrom(this.create(dto));
        this.invalidateUsers();
        return UserAssembler.toEntity(created);
    }

    async updateUser(id: number, user: User): Promise<User> {
        const dto = UserAssembler.toDTO(user);
        const updated = await firstValueFrom(this.update(id, dto));
        this.invalidateUsers();
        return UserAssembler.toEntity(updated);
    }

    async deleteUser(id: number): Promise<void> {
        await firstValueFrom(this.delete(id));
        this.invalidateUsers();
    }

    private getRawUsers(): Promise<any[]> {
        if (!this.usersRequest || Date.now() - this.usersCachedAt > this.usersCacheTtlMs) {
            this.usersCachedAt = Date.now();
            this.usersRequest = firstValueFrom(this.getAll())
              .then(response => Array.isArray(response) ? response as any[] : ((response as any)?.value ?? []))
              .catch(error => { this.usersRequest = undefined; throw error; });
        }
        return this.usersRequest;
    }

    private invalidateUsers(): void { this.usersRequest = undefined; this.usersCachedAt = 0; }
}
