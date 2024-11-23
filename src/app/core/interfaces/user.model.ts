import { RoleModel } from "./role.model";

export interface UserModel {
  id: string;
  f_name: string;
  l_name: string;
  status: string;
  email: string;
  // roles: Role[];
  otp_expires_at: Date;
  otp_enabled: boolean;
  reset_password_sent_at: Date;
  remember_created_at: Date;
  confirmed_at: Date;
  confirmation_sent_at: Date;
  unconfirmed_email: string;
  failed_attempts: number;
  locked_at: Date;
  created_at: Date;
  updated_at: Date;
  sign_in_count: number;
  current_sign_in_at: Date;
  last_sign_in_at: Date;
  last_seen_at: Date;
  roles: RoleModel[];
  profile_image_url: string;
  bio: string
}

export interface UserModelsResponse {
  data: UserModel[];
  current_page: number;
  first_page: boolean;
  last_page: boolean;
  out_of_range: boolean;
  per_page: number;
  total_pages: number;
  total: number;
}
