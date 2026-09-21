export type TechNewsStatus = "draft" | "published" | "archived";

export interface TechNewsSource {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  active_stories_count?: number;
}

export interface TechNewsStory {
  id: string;
  source_id: string;
  source_name?: string | null;
  source_logo_url?: string | null;
  title: string;
  headline?: string;
  summary: string;
  content: string;
  why_it_matters?: string | null;
  cover_image_url?: string | null;
  source_url?: string | null;
  status: TechNewsStatus;
  display_order: number;
  published_at?: string | null;
  visible_from?: string | null;
  visible_until?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source?: TechNewsSource | null;
}

export interface GroupedTechNewsSource extends TechNewsSource {
  stories: TechNewsStory[];
}

export interface CreateTechNewsSourcePayload {
  name: string;
  slug?: string;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export type UpdateTechNewsSourcePayload = Partial<CreateTechNewsSourcePayload>;

export interface CreateTechNewsStoryPayload {
  source_id: string;
  title: string;
  headline?: string;
  summary: string;
  content: string;
  why_it_matters?: string | null;
  cover_image_url?: string | null;
  source_url?: string | null;
  status?: TechNewsStatus;
  display_order?: number;
  visible_from?: string | null;
  visible_until?: string | null;
}

export type UpdateTechNewsStoryPayload = Partial<CreateTechNewsStoryPayload>;
