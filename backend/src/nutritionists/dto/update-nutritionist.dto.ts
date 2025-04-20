import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateNutritionistDto } from './create-nutritionist.dto';

export class UpdateNutritionistDto extends PartialType(
  OmitType(CreateNutritionistDto, ['password'] as const),
) {
  photoUrl?: string;
  instagram?: string;
}
