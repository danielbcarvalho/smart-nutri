import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { NutritionistsService } from '../../nutritionists/nutritionists.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private nutritionistsService: NutritionistsService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const nutritionist = await this.nutritionistsService.findOne(payload.sub);
    if (!nutritionist) {
      throw new UnauthorizedException('Nutricionista não encontrado');
    }
    return {
      id: nutritionist.id,
      email: nutritionist.email,
      role: 'nutritionist',
    };
  }
}
