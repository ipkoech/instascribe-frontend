export interface Trigger {
  id: string;
  codename: string;
  description: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface TriggersResponse {
  data: Trigger[];
  current_page: number;
  first_page: boolean;
  last_page: boolean;
  out_of_range: boolean;
  per_page: number;
  total_pages: number;
  total: number;
}
