import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly ROLE_ID_KEY = 'restock_role_id';
  private readonly PROFILE_ID_KEY = 'restock_profile_id';

  //USER ID
  getUserId(): number | null {
    const value = localStorage.getItem('user_id');
    return value ? +value : null;
  }

  // ROLE ID
  setRoleId(roleId: number): void {
    localStorage.setItem(this.ROLE_ID_KEY, roleId.toString());
  }

  getRoleId(): number | null {
    const value = localStorage.getItem(this.ROLE_ID_KEY);
    return value ? +value : null;
  }

  clearRoleId(): void {
    localStorage.removeItem(this.ROLE_ID_KEY);
  }

  // PROFILE ID
  setProfileId(profileId: number): void {
    localStorage.setItem(this.PROFILE_ID_KEY, profileId.toString());
  }

  getProfileId(): number | null {
    const value = localStorage.getItem(this.PROFILE_ID_KEY);
    return value ? +value : null;
  }

  clearProfileId(): void {
    localStorage.removeItem(this.PROFILE_ID_KEY);
  }

  clearAll(): void {
    this.clearRoleId();
    this.clearProfileId();
  }

  // ROTATION EXPERIMENT GROUP (Experimento 04 - To-Be, US-40)
  private readonly ROTATION_EXPERIMENT_OVERRIDE_KEY = 'restock_rotation_experiment_override';

  /**
   * Deterministically assigns a user to the rotation-indicator experimental
   * group so the control group keeps seeing the original inventory table.
   * Can be forced via localStorage for manual QA of either group.
   */
  isInRotationExperimentGroup(): boolean {
    const override = localStorage.getItem(this.ROTATION_EXPERIMENT_OVERRIDE_KEY);
    if (override !== null) return override === 'true';

    const userId = this.getUserId();
    if (userId == null) return false;
    return userId % 2 === 0;
  }
}
