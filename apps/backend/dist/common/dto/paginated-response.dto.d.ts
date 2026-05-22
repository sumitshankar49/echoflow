export declare class PaginatedResponseDto<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    constructor(data: T[], total: number, page: number, limit: number);
}
