import { Trigger } from './trigger';

export interface Alert {
  id: string;
  codename: string;
  description: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  triggers: Trigger[];
}

export interface AlertsResponse {
  data: Alert[];
  current_page: number;
  first_page: boolean;
  last_page: boolean;
  out_of_range: boolean;
  per_page: number;
  total_pages: number;
  total: number;
}
