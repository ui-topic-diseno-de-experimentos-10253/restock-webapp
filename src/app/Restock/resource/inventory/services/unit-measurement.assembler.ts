import {UnitMeasurement} from '../model/unit-measurement.entity';

export class UnitMeasurementAssembler {
  static toEntity(dto: any): UnitMeasurement {
    return UnitMeasurement.fromPersistence(dto);
  }

  static toDTO(entity: UnitMeasurement): any {
    return {
      id: entity.id,
      name: entity.name
    };
  }
}
