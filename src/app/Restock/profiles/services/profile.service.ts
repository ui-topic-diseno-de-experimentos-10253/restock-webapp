/* import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../model/profile.entity';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private profileSubject = new BehaviorSubject<Profile>(this.loadInitialProfile());
  profile$ = this.profileSubject.asObservable();

  getCurrentProfile(): Profile {

    return { ...this.profileSubject.value };
  }

  updateProfile(updated: Profile): void {

    this.profileSubject.next(updated);
  }

  private loadInitialProfile(): Profile {
    return {
      name: 'Elon',
      lastName: 'Musk',
      email: 'elon@gmail.com',
      phone: '+51 940 163 699',
      address: 'Av. Paseo de la República cuadra 2 - Perú',
      country: 'Perú',
      companyName: 'Alimentos S.A.',
      companyAddress: 'Av. Paseo de la República cuadra 3',
      companyCategories: ['Fast Food'],
      description: '',
      image: 'assets/admin-avatar.png'
    };
  }
}
 */


// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { Profile } from '../model/profile.entity';
// import { HttpClient } from '@angular/common/http';
// import { map } from 'rxjs/operators';
// import { environment } from '../../../../environments/environment';
// import { ProfileAssembler } from './profile.assembler';

// @Injectable({ providedIn: 'root' })
// export class ProfileService {
//   private profileSubject = new BehaviorSubject<Profile>(this.loadInitialProfile());
//   profile$ = this.profileSubject.asObservable();

//   constructor(private http: HttpClient) { }

//   getCurrentProfile(): Profile {
//     return { ...this.profileSubject.value };
//   }
//   loadProfilesByUserIds(userIds: number[]): Observable<Profile[]> {
//     if (userIds.length === 0) {
//       return new BehaviorSubject<Profile[]>([]);
//     }

//     const query = userIds.map(id => `user_id=${id}`).join('&');
//     const url = `${environment.serverBaseUrl}/profiles?${query}`;

//     return this.http.get<any[]>(url).pipe(
//       map((dtos) => dtos.map(dto => ProfileAssembler.fromDto(dto)))
//     );
//   }
//   updateProfile(updated: Profile): void {
//     this.profileSubject.next(updated);
//   }


//   loadProfileByUserId(userId: number): Observable<Profile> {
//     return this.http
//       .get<any[]>(`${environment.serverBaseUrl}/profiles?user_id=${userId}`)
//       .pipe(
//         map((profiles) => profiles[0]), // se espera solo uno
//         map((dto) => ProfileAssembler.fromDto(dto)),
//         map((profile) => {
//           this.profileSubject.next(profile);
//           return profile;
//         })
//       );
//   }

//   private loadInitialProfile(): Profile {
//     return new Profile();
//   }
// }



import { Injectable } from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, of} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BaseService } from '../../../shared/services/base.service';
import { Profile } from '../model/profile.entity';
import { ProfileAssembler } from './profile.assembler';

@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseService<Profile> {
  private profileSubject = new BehaviorSubject<Profile>(this.loadInitialProfile());
  profile$ = this.profileSubject.asObservable();

  constructor() {
    super();
    this.resourceEndpoint = '/profiles';
  }

  getCurrentProfile(): Profile {
    return { ...this.profileSubject.value };
  }

  async getAllProfiles(): Promise<Profile[]> {
    const rawProfiles = await firstValueFrom(this.getAll());

    return rawProfiles.map(raw => {
      return new Profile({
        ...ProfileAssembler.toEntity(raw)
      });
    });
  }

  async getProfileById(id: number): Promise<Profile> {
    const raw = await firstValueFrom(this.getById(id));
    return new Profile({
      ...ProfileAssembler.toEntity(raw)
    });
  }

  async updateProfile(id: number, profile: Profile): Promise<Profile> {
    const dto = ProfileAssembler.toDTO(profile);
    const updated = await firstValueFrom(this.update(id, dto));
    return ProfileAssembler.toEntity(updated);
  }

  loadProfilesByUserIds(userIds: number[]): Observable<Profile[]> {
    if (!userIds || userIds.length === 0) {
      return of([]);
    }

    const query = userIds.map(id => `user_id=${id}`).join('&');
    const url = `${environment.serverBaseUrlBackend}${this.resourceEndpoint}?${query}`;

    return this.http.get<any[]>(url).pipe(
      map(dtos => dtos.map(dto => ProfileAssembler.toEntity(dto)))
    );
  }

  loadProfileByUserId(userId: number): Observable<Profile> {
    const url = `${environment.serverBaseUrlBackend}${this.resourceEndpoint}?user_id=${userId}`;

    return this.http.get<any[]>(url).pipe(
      map(profiles => profiles[0]), // Se espera solo uno
      map(dto => ProfileAssembler.toEntity(dto)),
      map(profile => {
        this.profileSubject.next(profile);
        return profile;
      })
    );
  }
  private loadInitialProfile(): Profile {
    return new Profile();
  }

}
