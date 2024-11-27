import { ConversationModel } from "./conversation.model";
import { UserModel } from "./user.model";

export interface ChatModel {
  id: string;
  user_input?: string;
  conversation_id?: string;
  bot_reply?: string|undefined;
  role?: 'user' | 'bot';
  highlighted_text?: string;
  reply_to_highlight?: string;
  liked?: boolean;
  disliked?: boolean;
  created_at?: Date;
  updated_at?: Date;
  conversation?: ConversationModel;
  user?: UserModel|undefined;
}
export interface ChatsResponse {
  "data": ChatModel[],
  "current_page": number
  "first_page": boolean
  "last_page": boolean
  "out_of_range": boolean
  "per_page": number
  "total_pages": number
  "total": number
}
