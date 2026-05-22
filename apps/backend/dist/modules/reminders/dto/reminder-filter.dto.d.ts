import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
export declare class ReminderFilterDto extends PaginationQueryDto {
    isCompleted?: boolean;
    from?: string;
    to?: string;
}
