import {Injectable, Injector} from '@angular/core';
import {Business} from '../model/business.entity';
import {BaseService} from '../../../shared/services/base.service';
import {firstValueFrom} from 'rxjs';
import {BusinessAssembler} from './business.assembler';
import {Profile} from '../model/profile.entity';
import {ProfileAssembler} from './profile.assembler';

@Injectable({
  providedIn: 'root'
})
export class BusinessService extends BaseService<Business> {
  private readonly injector: Injector;

  constructor(injector: Injector)
  {
    super();
    this.resourceEndpoint = '/businesses';
    this.injector = injector;
  }

  async getAllBusinesses(): Promise<Business[]> {
    const rawBusinesses = await firstValueFrom(this.getAll());

    return rawBusinesses.map(raw => {
      return new Business({
        ...BusinessAssembler.toEntity(raw)
      });
    });
  }

  async getBusinessById(id: number): Promise<Business> {
    const raw = await firstValueFrom(this.getById(id));
    return new Business({
      ...BusinessAssembler.toEntity(raw)
    });
  }

  async createBusiness(business: Business): Promise<Business> {
    const dto = BusinessAssembler.toDTO(business);
    const response$ = super.create(dto);
    const raw = await firstValueFrom(response$);
    return BusinessAssembler.toEntity(raw);
  }

  async deleteBusiness(id: number | null): Promise<void> {
    await firstValueFrom(super.delete(id));
  }

  async updateBusiness(id: number | null, business: Business): Promise<Business> {
    const dto = BusinessAssembler.toDTO(business);
    const response$ = super.update(id, dto);
    const updated = await firstValueFrom(response$);
    return BusinessAssembler.toEntity(updated);
  }
}

