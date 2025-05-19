import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { NutritionistsService } from '../nutritionists/nutritionists.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  private tokenVersions: Map<string, number> = new Map();

  constructor(
    private nutritionistsService: NutritionistsService,
    private jwtService: JwtService,
  ) {}

  getTokenVersion(nutritionistId: string): number {
    return this.tokenVersions.get(nutritionistId) || 0;
  }

  private incrementTokenVersion(nutritionistId: string): number {
    const currentVersion = this.getTokenVersion(nutritionistId);
    const newVersion = currentVersion + 1;
    this.tokenVersions.set(nutritionistId, newVersion);
    return newVersion;
  }

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
      version: this.getTokenVersion(nutritionist.id),
    };

    const settings = await this.nutritionistsService.getSettings(
      nutritionist.id,
    );

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
        customColors: settings.customColors,
        customFonts: settings.customFonts,
        logoUrl: settings.logoUrl,
      },
    };
  }

  async logout(user: AuthenticatedUser) {
    // No JWT, o logout é feito no lado do cliente removendo o token
    // Aqui podemos adicionar lógica adicional se necessário
    return {
      message: 'Logout realizado com sucesso',
    };
  }

  async forceLogoutNutritionist(email: string) {
    const nutritionist = await this.nutritionistsService.findByEmail(email);

    if (!nutritionist) {
      throw new NotFoundException('Nutricionista não encontrado');
    }

    // Incrementa a versão do token, invalidando todos os tokens anteriores
    this.incrementTokenVersion(nutritionist.id);

    return {
      message: `Logout forçado realizado com sucesso para o nutricionista ${nutritionist.name}`,
      nutritionist: {
        id: nutritionist.id,
        name: nutritionist.name,
        email: nutritionist.email,
      },
    };
  }
}
