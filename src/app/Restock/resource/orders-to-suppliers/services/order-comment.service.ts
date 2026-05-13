import { Injectable } from '@angular/core';
import { BaseService } from '../../../../shared/services/base.service';
import { firstValueFrom } from 'rxjs';

import { OrderComment } from '../model/order-comment.entity';
import { OrderCommentAssembler } from './order-comment.assembler';

@Injectable({ providedIn: 'root' })
export class OrderCommentService extends BaseService<OrderComment> {
  constructor() {
    super();
    this.resourceEndpoint = '/orders_comments';
  }

  async getAllComments(): Promise<OrderComment[]> {
    const dtos = await firstValueFrom(this.getAll());
    return dtos.map(dto => OrderCommentAssembler.toEntity(dto));
  }

  async getCommentById(id: number): Promise<OrderComment> {
    const dto = await firstValueFrom(this.getById(id));
    return OrderCommentAssembler.toEntity(dto);
  }

  async createComment(comment: OrderComment): Promise<OrderComment> {
    const dto = OrderCommentAssembler.toDTO(comment);
    const created = await firstValueFrom(this.create(dto));
    return OrderCommentAssembler.toEntity(created);
  }

  async updateComment(id: number, comment: OrderComment): Promise<OrderComment> {
    const dto = OrderCommentAssembler.toDTO(comment);
    const updated = await firstValueFrom(this.update(id, dto));
    return OrderCommentAssembler.toEntity(updated);
  }

  async deleteComment(id: number): Promise<void> {
    await firstValueFrom(this.delete(id));
  }
}
