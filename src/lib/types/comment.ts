
import { Database } from './supabase';
import { User } from './user';

export type DbComment = Database['public']['Tables']['comments']['Row'];

export interface Comment extends Omit<DbComment, 'parent_id'> {
  user?: User;
  replies?: Comment[];
  parent_id?: string | null;
}

export interface CreateCommentData {
  designFileId: string;
  content: string;
  x?: number | null;
  y?: number | null;
  parentId?: string | null;
}