import {BaseService} from '../../../../shared/services/base.service';
import {UnitMeasurement} from '../model/unit-measurement.entity';
import {firstValueFrom, map} from 'rxjs';
import {Injectable} from '@angular/core';
import {UnitMeasurementAssembler} from './unit-measurement.assembler';

@Injectable({ providedIn: 'root' })
export class UnitMeasurementService extends BaseService<UnitMeasurement> {
  constructor() {
    super();
    this.resourceEndpoint = '/units_measurement';
  }

  async getAllUnitMeasurements(): Promise<UnitMeasurement[]> {
    const response$ = super.getAll();
    const rawDtos = await firstValueFrom(response$);
    return rawDtos.map(UnitMeasurementAssembler.toEntity);
  }
}

