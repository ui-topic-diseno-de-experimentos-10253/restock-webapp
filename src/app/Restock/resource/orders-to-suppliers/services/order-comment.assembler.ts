import { OrderComment } from '../model/order-comment.entity';
import { OrderToSupplier } from '../model/order-to-supplier.entity';

export class OrderCommentAssembler {
  static toEntity(dto: any, order?: OrderToSupplier): OrderComment {
    const comment = new OrderComment({
      id: dto.id,
      order_to_supplier_id: dto.order_to_supplier_id,
      content: dto.content,
      rating: dto.rating,
      date: dto.date ? new Date(dto.date) : new Date()
    });

    if (order) {
      comment.order_to_supplier = order;
    }

    return comment;
  }

  static toDTO(entity: OrderComment): any {
    return {
      id: entity.id,
      order_to_supplier_id: entity.order_to_supplier_id,
      content: entity.content,
      rating: entity.rating,
      date: entity.date.toISOString()
    };
  }
}
