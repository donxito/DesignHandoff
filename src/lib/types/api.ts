export interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
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
    filter?: Record<string, any>;
}
    
