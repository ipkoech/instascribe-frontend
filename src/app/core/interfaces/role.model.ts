import { PermissionModel } from "./permission.model";
import { UserModel } from "./user.model";

export interface RoleModel { id: string;
  name: string;
  description: string;
  permissions: PermissionModel[];
  users: UserModel[];
}

export interface RolesResponse {
  "data": RoleModel[],
  "current_page": number
  "first_page": boolean
  "last_page": boolean
  "out_of_range": boolean
  "per_page": number
  "total_pages": number
  "total": number
}
