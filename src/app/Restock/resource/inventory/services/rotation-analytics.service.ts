import {Injectable} from '@angular/core';

/**
 * Emits the Angular/Web tracking events defined for Experiment 04
 * (Comportamiento basado en Datos - chapter 8, section 8.2.8).
 * Kept as a lightweight console-based sink so it can be wired to
 * Firebase Analytics later without changing call sites.
 */
@Injectable({
  providedIn: 'root'
})
export class RotationAnalyticsService {
  private logEvent(name: string, params: Record<string, unknown>): void {
    console.info(`[rotation-experiment] ${name}`, params);
  }

  rotationColumnViewed(userId: number, itemsVisible: number): void {
    this.logEvent('rotation_column_viewed', {user_id: userId, items_visible: itemsVisible});
  }

  rotationLevelHovered(supplyId: number, rotationLevel: string, dwellTimeMs: number): void {
    this.logEvent('rotation_level_hovered', {supply_id: supplyId, rotation_level: rotationLevel, dwell_time_ms: dwellTimeMs});
  }

  orderQuantityEntered(supplyId: number, rotationLevel: string, quantityEntered: number): void {
    this.logEvent('order_quantity_entered', {supply_id: supplyId, rotation_level: rotationLevel, quantity_entered: quantityEntered});
  }

  lowRotationItemRemoved(supplyId: number, quantityRemoved: number): void {
    this.logEvent('low_rotation_item_removed', {supply_id: supplyId, quantity_removed: quantityRemoved});
  }

  orderSubmittedWithRotation(lowRotationItemsCount: number, totalItems: number, totalQuantity: number): void {
    this.logEvent('order_submitted_with_rotation', {
      low_rotation_items_count: lowRotationItemsCount,
      total_items: totalItems,
      total_quantity: totalQuantity
    });
  }
}
