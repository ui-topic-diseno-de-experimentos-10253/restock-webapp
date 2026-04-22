export interface BusinessCategoryDto {
  id: string;
  name: string;
}

// GET /api/v1/profiles/{userId}
export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  avatar: string;
  businessName: string;
  businessAddress: string;
  description: string;
  businessCategories: BusinessCategoryDto[];
}

// PUT /api/v1/profiles/{userId}/personal
export interface UpdatePersonalProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  avatar: string;
}

// PUT /api/v1/profiles/{userId}/business
export interface UpdateBusinessProfileRequest {
  businessName: string;
  businessAddress: string;
  description: string;
}

// PUT /api/v1/profiles/{userId}/password
export interface UpdateProfilePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
