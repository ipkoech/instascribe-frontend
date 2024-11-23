
import { ChatModel } from "./chat.model";
import { UserModel } from "./user.model";

export interface ConversationModel { id: string;
  title: string;
  archived: boolean;
  created_at: Date;
  updated_at: Date;
  chats: ChatModel[];
  user: UserModel;
}

export interface ConversationsResponse {
  "data": ConversationModel[],
  "current_page": number
  "first_page": boolean
  "last_page": boolean
  "out_of_range": boolean
  "per_page": number
  "total_pages": number
  "total": number
}
