export type ScholarshipStatus = "draft" | "published" | "archived";

export interface ScholarshipItem {
  id: string;
  name: string;
  provided_by: string;
  qualification_required: string;
  eligibility: string;
  requirements: string;
  application_url: string;
  image_url?: string | null;
  status: ScholarshipStatus;
  visible_from?: string | null;
  visible_until?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateScholarshipPayload {
  name: string;
  provided_by: string;
  qualification_required: string;
  eligibility: string;
  requirements: string;
  application_url: string;
  image_url?: string | null;
  status?: ScholarshipStatus;
  visible_from?: string | null;
  visible_until?: string | null;
}

export type UpdateScholarshipPayload = Partial<CreateScholarshipPayload>;
