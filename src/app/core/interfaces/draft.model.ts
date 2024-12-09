import { ConversationModel } from "./conversation.model";
import { UserModel } from "./user.model";

export interface DraftModel {
  id: string;
  title: string;
  content: string;
  content_type: string;
  original_content: string;
  status: string;
  active: boolean;
  user_id: string;
  access_level: string;
  created_at: Date;
  updated_at: Date;
  author?: UserModel;
  collaborators?: UserModel[];
}

export interface DraftsResponse {
  data: DraftModel[];
  current_page: number;
  first_page: boolean;
  last_page: boolean;
  out_of_range: boolean;
  per_page: number;
  total_pages: number;
  total: number;
}
