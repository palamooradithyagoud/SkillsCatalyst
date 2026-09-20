export type EventCategory = "online" | "offline";
export type EventMode = "online" | "offline" | "hybrid";
export type EventStatus = "draft" | "published" | "archived";

export interface EventItem {
  id: string;
  event_name: string;
  conducted_by_college: string;
  event_link: string;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  location?: string | null;
  category: EventCategory;
  banner_url: string;
  description?: string | null;
  is_hackathon: boolean;
  prize_pool?: string | null;
  team_size?: string | null;
  mode?: EventMode | null;
  status: EventStatus;
  visible_from?: string | null;
  visible_until?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventPayload {
  event_name: string;
  conducted_by_college: string;
  event_link: string;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  category: EventCategory;
  banner_url: string;
  location?: string | null;
  description?: string | null;
  is_hackathon: boolean;
  prize_pool?: string | null;
  team_size?: string | null;
  mode?: EventMode | null;
  status?: EventStatus;
  visible_from?: string | null;
  visible_until?: string | null;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
