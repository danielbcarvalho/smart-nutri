import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    // Usar uma chave secreta do arquivo de configuração
    // IMPORTANTE: Esta chave deve ser armazenada em variáveis de ambiente para produção
    this.secretKey =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      'mvp-temporary-secret-key';
  }

  /**
   * Criptografa uma string usando AES
   * @param text Texto para criptografar
   * @returns Texto criptografado
   */
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  /**
   * Descriptografa uma string criptografada
   * @param encryptedText Texto criptografado
   * @returns Texto original descriptografado
   */
  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
