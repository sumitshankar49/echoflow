"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponseDto = void 0;
class PaginatedResponseDto {
    constructor(data, total, page, limit) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.totalPages = Math.ceil(total / limit);
    }
}
exports.PaginatedResponseDto = PaginatedResponseDto;
//# sourceMappingURL=paginated-response.dto.js.map