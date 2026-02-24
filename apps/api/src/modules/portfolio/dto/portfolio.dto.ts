import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PortfolioEntryType } from '../../../shared/enums';

export class UpdatePortfolioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  theme?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreatePortfolioEntryDto {
  @ApiProperty({ enum: PortfolioEntryType })
  @IsEnum(PortfolioEntryType)
  type: PortfolioEntryType;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AddSkillDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  level?: number;
}
