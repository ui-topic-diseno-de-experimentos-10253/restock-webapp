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
import {
  UpdateBusinessProfileRequest,
  UpdatePersonalProfileRequest,
  UpdateProfilePasswordRequest,
  UserProfile
} from '../model/user-profile.contract';

@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseService<Profile> {
  private profileSubject = new BehaviorSubject<Profile>(this.loadInitialProfile());
  profile$ = this.profileSubject.asObservable();

  constructor() {
    super();
    this.resourceEndpoint = '/profiles';
  }

  getByUserId(userId: number): Observable<UserProfile> {
    const url = `${environment.serverBaseUrlBackend}${this.resourceEndpoint}/${userId}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(
        map(response => this.normalizeUserProfileResponse(response))
      );
  }

  updatePersonal(userId: number, payload: UpdatePersonalProfileRequest): Observable<any> {
    const url = `${environment.serverBaseUrlBackend}${this.resourceEndpoint}/${userId}/personal`;
    return this.http.put(
      url,
      payload,
      this.httpOptions
    );
  }

  updateBusiness(userId: number, payload: UpdateBusinessProfileRequest): Observable<any> {
    return this.http.put(
      `${environment.serverBaseUrlBackend}${this.resourceEndpoint}/${userId}/business`,
      payload,
      this.httpOptions
    );
  }

  updatePassword(userId: number, payload: UpdateProfilePasswordRequest): Observable<any> {
    return this.http.put(
      `${environment.serverBaseUrlBackend}${this.resourceEndpoint}/${userId}/password`,
      payload,
      this.httpOptions
    );
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
    const updated = await firstValueFrom(
      this.http.put<any>(`${environment.serverBaseUrlBackend}${this.resourceEndpoint}/${id}`, dto, this.httpOptions)
    );
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
    return this.getByUserId(userId).pipe(
      map((dto: UserProfile) => this.toLegacyProfile(dto)),
      map(profile => {
        this.profileSubject.next(profile);
        return profile;
      })
    );
  }

  private normalizeUserProfileResponse(response: any): UserProfile {
    const raw = Array.isArray(response)
      ? response[0]
      : (Array.isArray(response?.value) ? response.value[0] : response);
    if (!raw) {
      throw new Error('Profile response is empty');
    }

    return {
      userId: Number(raw.userId ?? raw.user_id ?? raw.id ?? 0),
      firstName: raw.firstName ?? raw.name ?? '',
      lastName: raw.lastName ?? raw.last_name ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      address: raw.address ?? '',
      country: raw.country ?? '',
      avatar: raw.avatar ?? '',
      businessName: raw.businessName ?? raw.business?.name ?? '',
      businessAddress: raw.businessAddress ?? raw.business?.address ?? '',
      description: raw.description ?? raw.business?.description ?? '',
      businessCategories: Array.isArray(raw.businessCategories)
        ? raw.businessCategories
        : []
    };
  }

  private toLegacyProfile(dto: UserProfile): Profile {
    return new Profile({
      id: dto.userId,
      name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email,
      avatar: dto.avatar,
      phone: dto.phone,
      address: dto.address,
      country: dto.country,
      user_id: dto.userId,
      business: {
        name: dto.businessName,
        address: dto.businessAddress,
        categories: dto.businessCategories.map(category => category.name).join(', '),
        description: dto.description
      } as any
    });
  }
  private loadInitialProfile(): Profile {
    return new Profile();
  }

}
