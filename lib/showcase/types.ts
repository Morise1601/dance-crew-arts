export interface ShowcaseCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface ShowcaseMedia {
  id: string;
  category_id: string;
  name: string;
  description: string;
  url: string;
  storage_path: string;
  media_type: 'image' | 'video';
  mime_type: string;
  size_bytes: number;
  sort_order: number;
  is_active: boolean;
  status: 'pending' | 'published' | 'deleting';
  created_at: string;
}

export interface ShowcaseData {
  categories: ShowcaseCategory[];
  media: ShowcaseMedia[];
  error: string | null;
}
