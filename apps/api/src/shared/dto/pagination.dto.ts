import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };

  constructor(data: T[], cursor: string | null, hasMore: boolean, total?: number) {
    this.data = data;
    this.meta = { cursor, hasMore, total };
  }
}
