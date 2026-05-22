import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
export declare class NoteFilterDto extends PaginationQueryDto {
    isFavorite?: boolean;
    tag?: string;
}
