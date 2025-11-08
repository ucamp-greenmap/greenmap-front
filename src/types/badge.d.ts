export interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface BadgeInfo {
    name: string;
    progress: number;
    standard: number;
    description: string;
    image_url: string | null;
    created_at: string;
    isAcquired: boolean;
    isSelected: boolean;
}

export interface BadgeRequest {
    categoryId: number;
    name: string;
    requirement: number;
    description: string;
    image_url: string;
}
