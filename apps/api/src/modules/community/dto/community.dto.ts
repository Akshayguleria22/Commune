import { IsString, IsOptional, IsEnum, IsArray, MinLength, MaxLength, Matches, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityVisibility } from '../../../shared/enums';

export class CreateCommunityDto {
  @ApiProperty({ example: 'AI Builders' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ai-builders' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CommunityVisibility })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];
}

export class UpdateCommunityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CommunityVisibility })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Moderator' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: '#6C5CE7' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  permissions?: Record<string, boolean>;
}
