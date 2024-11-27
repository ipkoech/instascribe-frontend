export interface PermissionModel {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionsResponse {
  "data": PermissionModel[],
  "current_page": number
  "first_page": boolean
  "last_page": boolean
  "out_of_range": boolean
  "per_page": number
  "total_pages": number
  "total": number
}
