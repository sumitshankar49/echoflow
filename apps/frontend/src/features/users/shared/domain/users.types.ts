type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

type RelationshipStatus =
  | 'single'
  | 'in_relationship'
  | 'engaged'
  | 'married'
  | 'complicated'
  | 'prefer_not_to_say';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: Gender | null;
  dob?: string | null;
  mobileNumber?: string | null;
  relationshipStatus?: RelationshipStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  gender?: Gender;
  dob?: string;
  mobileNumber?: string;
  relationshipStatus?: RelationshipStatus;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  message: string;
}