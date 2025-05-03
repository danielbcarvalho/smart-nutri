import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { NutritionistsService } from '../nutritionists/nutritionists.service';

@Injectable()
export class AuthService {
  constructor(
    private nutritionistsService: NutritionistsService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const nutritionist = await this.nutritionistsService.findByEmail(
      loginDto.email,
    );

    if (!nutritionist) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await this.nutritionistsService.validatePassword(
      nutritionist,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: nutritionist.id,
      email: nutritionist.email,
      role: 'nutritionist',
    };

    return {
      access_token: this.jwtService.sign(payload),
      nutritionist: {
        id: nutritionist.id,
        name: nutritionist.name,
        email: nutritionist.email,
        crn: nutritionist.crn,
        clinicName: nutritionist.clinicName,
        photoUrl: nutritionist.photoUrl,
        instagram: nutritionist.instagram,
      },
    };
  }
}
