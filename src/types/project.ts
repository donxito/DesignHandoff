// Project type definition
export type Project = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Create project payload
export type CreateProjectPayload = {
  name: string;
  description?: string;
  thumbnail_url?: string;
};
