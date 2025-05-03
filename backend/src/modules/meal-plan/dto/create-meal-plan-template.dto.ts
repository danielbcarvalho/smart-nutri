import {
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoodTemplateDto {
  @IsString()
  name: string;

  @IsString()
  portion: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateMealTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  time: string;

  @ValidateNested({ each: true })
  @Type(() => CreateFoodTemplateDto)
  @IsArray()
  foods: CreateFoodTemplateDto[];
}

export class CreateMealPlanTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ValidateNested({ each: true })
  @Type(() => CreateMealTemplateDto)
  @IsArray()
  meals: CreateMealTemplateDto[];
}
