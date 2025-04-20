import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import * as process from 'process';

@Injectable()
export class InstagramScrapingService {
  private readonly logger = new Logger(InstagramScrapingService.name);

  // User-Agent para simular um navegador comum
  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

  // Seletores conhecidos (serão tentados, mas são frágeis)
  private readonly instagramImageSelectors = [
    'img._aadp', // Seletor comum para a imagem principal em algumas versões
    'img.xpdipgo', // Outro seletor observado
    'img[data-testid="user-avatar"]', // Test IDs podem ser mais estáveis às vezes
    'img[alt*="profile picture"]', // Alt text pode ser uma pista
    'img[alt*="foto do perfil"]', // Alt text em português
  ];

  /**
   * Tenta extrair a URL da foto de perfil do Instagram para um dado username.
   * ATENÇÃO: O scraping do Instagram é instável devido a mudanças frequentes
   * na plataforma e medidas anti-scraping. Esta função pode parar de funcionar
   * a qualquer momento sem aviso prévio. Considere usar a API oficial do Instagram
   * (Graph API) para uma solução robusta e suportada, embora exija autenticação.
   *
   * @param username O nome de usuário do Instagram.
   * @returns A URL da foto de perfil ou null se não for encontrada ou ocorrer um erro.
   */
  async getProfilePictureUrl(username: string): Promise<string | null> {
    if (!username) {
      this.logger.warn('Username cannot be empty.');
      return null;
    }
    const url = `https://www.instagram.com/${username}/`;
    const headers = {
      'User-Agent': this.userAgent,
      'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8', // Aceita inglês e português
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      // Adicionar mais headers pode ajudar a parecer menos um bot
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Upgrade-Insecure-Requests': '1',
    };

    this.logger.log(
      `Iniciando scraping para o perfil: ${username} na URL: ${url}`,
    );

    try {
      // --- Configuração de Bright Data Web Unlocker (API HTTP) ---
      const brightDataApiToken = process.env.BRIGHTDATA_API_TOKEN;
      const brightDataZone = 'web_unlocker1';
      let html: string;

      if (brightDataApiToken) {
        // Usar API HTTP do Bright Data
        const apiResponse = await axios.post(
          'https://api.brightdata.com/request',
          {
            zone: brightDataZone,
            url,
            format: 'raw',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${brightDataApiToken}`,
            },
            timeout: 20000,
          },
        );
        html = apiResponse.data;
        this.logger.log(
          `[BrightData] Web Unlocker API utilizada para scraping Instagram: ${url}`,
        );
      } else {
        // Fallback: scraping direto (apenas para dev/local)
        const response = await axios.get(url, {
          headers,
          timeout: 10000,
        });
        html = response.data;
      }
      const $ = cheerio.load(html);

      // --- Estratégia 1: Meta Tag Open Graph (og:image) ---
      const ogImageUrl = $('meta[property="og:image"]').attr('content');
      if (ogImageUrl && this.isValidUrl(ogImageUrl)) {
        this.logger.log(
          `[${username}] Encontrado via meta tag og:image: ${ogImageUrl}`,
        );
        return ogImageUrl;
      }
      this.logger.log(
        `[${username}] Meta tag og:image não encontrada ou inválida.`,
      );

      // --- Estratégia 2: JSON embutido em <script type="application/ld+json"> ---
      let ldJsonUrl: string | null = null;
      $('script[type="application/ld+json"]').each((_, element) => {
        try {
          const scriptContent = $(element).html();
          if (scriptContent) {
            const jsonData = JSON.parse(scriptContent);
            // A estrutura pode variar, procuramos por 'image' ou 'thumbnailUrl'
            const potentialUrl =
              jsonData?.image?.url || jsonData?.image || jsonData?.thumbnailUrl;

            if (
              potentialUrl &&
              typeof potentialUrl === 'string' &&
              this.isValidUrl(potentialUrl)
            ) {
              ldJsonUrl = potentialUrl;
              return false; // Para o loop .each
            }
          }
        } catch (e) {
          this.logger.warn(
            `[${username}] Erro ao parsear JSON-LD: ${(e as Error).message}`,
          );
          // Continua tentando outros scripts
        }
      });
      if (ldJsonUrl) {
        this.logger.log(`[${username}] Encontrado via JSON-LD: ${ldJsonUrl}`);
        return ldJsonUrl;
      }
      this.logger.log(`[${username}] Não encontrado via JSON-LD.`);

      // --- Estratégia 3: JSON embutido principal (em <script> normal) ---
      // Muitas vezes há um JSON grande em um script que define `window.__initialData` ou similar
      let inlineJsonUrl: string | null = null;
      $('script[type="text/javascript"]').each((_, element) => {
        const scriptContent = $(element).html();
        // Tenta encontrar um JSON que pareça conter dados do perfil
        if (scriptContent && scriptContent.includes('profile_pic_url_hd')) {
          try {
            // Esta é a parte mais difícil: extrair o JSON corretamente.
            // Pode ser necessário regex ou análise mais cuidadosa dependendo da estrutura.
            // Exemplo muito simplificado (PODE FALHAR FACILMENTE):
            const match = scriptContent.match(/"profile_pic_url_hd":"(.*?)"/);
            if (match && match[1] && this.isValidUrl(match[1])) {
              // A URL dentro do JSON pode estar escapada (\u0026 para &)
              inlineJsonUrl = match[1].replace(/\\u0026/g, '&');
              return false; // Para o loop .each
            }

            // Tentar outra variação comum
            const matchSimple = scriptContent.match(
              /"profile_pic_url":"(.*?)"/,
            );
            if (
              matchSimple &&
              matchSimple[1] &&
              this.isValidUrl(matchSimple[1])
            ) {
              inlineJsonUrl = matchSimple[1].replace(/\\u0026/g, '&');
              return false; // Para o loop .each
            }
          } catch (e) {
            // Ignora erros de parseamento, continua tentando
            this.logger.warn(
              `[${username}] Erro ao tentar extrair JSON de script inline: ${(e as Error).message}`,
            );
          }
        }
      });

      if (inlineJsonUrl) {
        this.logger.log(
          `[${username}] Encontrado via JSON em script inline: ${inlineJsonUrl}`,
        );
        return inlineJsonUrl;
      }
      this.logger.log(
        `[${username}] Não encontrado via JSON em script inline.`,
      );

      // --- Estratégia 4: Tentar Seletores CSS Conhecidos (Menos Confiável) ---
      for (const selector of this.instagramImageSelectors) {
        const imageUrl = $(selector).first().attr('src'); // Pega o primeiro encontrado
        if (imageUrl && this.isValidUrl(imageUrl)) {
          this.logger.log(
            `[${username}] Encontrado via seletor CSS '${selector}': ${imageUrl}`,
          );
          return imageUrl;
        }
      }
      this.logger.log(`[${username}] Não encontrado via seletores CSS.`);

      // --- Se nada funcionou ---
      this.logger.warn(
        `[${username}] Não foi possível encontrar a URL da foto de perfil após todas as tentativas. A estrutura da página pode ter mudado ou o perfil requer login.`,
      );
      // Loggar um trecho do HTML pode ajudar a depurar (cuidado com o tamanho do log)
      // this.logger.debug(`HTML inicial recebido para ${username}: ${html.substring(0, 500)}...`);
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          this.logger.warn(
            `[${username}] Perfil não encontrado (404 Not Found). URL: ${url}`,
          );
        } else if (axiosError.code === 'ECONNABORTED') {
          this.logger.error(`[${username}] Timeout ao buscar a URL: ${url}`);
        } else {
          this.logger.error(
            `[${username}] Erro do Axios ao buscar perfil: ${axiosError.message} (Status: ${axiosError.response?.status})`,
            axiosError.stack,
          );
          // Loggar a resposta pode dar pistas se houver (ex: página de login)
          // this.logger.debug(`Axios error response data for ${username}: ${axiosError.response?.data}`);
        }
      } else {
        this.logger.error(
          `[${username}] Erro inesperado ao processar o perfil: ${(error as Error).message}`,
          (error as Error).stack,
        );
      }
      return null;
    }
  }

  /**
   * Verifica se uma string é uma URL HTTP/HTTPS válida.
   * @param url A string para verificar.
   * @returns true se for uma URL válida, false caso contrário.
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (_) {
      return false; // Não é uma URL válida se o construtor URL falhar
    }
  }
}
