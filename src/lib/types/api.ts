export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;

    details?: unknown;
  };
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;

  filter?: Record<string, unknown>;
}
