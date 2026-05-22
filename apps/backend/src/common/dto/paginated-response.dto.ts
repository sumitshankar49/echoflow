export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.totalPages = Math.ceil(total / limit);
  }
}
