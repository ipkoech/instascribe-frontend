export interface NotificationModel {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: any;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationsResponse {
  "data": NotificationModel[],
  "current_page": number
  "first_page": boolean
  "last_page": boolean
  "out_of_range": boolean
  "per_page": number
  "total_pages": number
  "total": number
}
