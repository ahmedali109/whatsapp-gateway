import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { EvolutionSendTextResponse } from '../types/evolution-message.types';
import { EvolutionApiException } from '../exceptions/evolution-api.exception';
import axios from 'axios';

@Injectable()
export class EvolutionClient {
  private readonly logger = new Logger(EvolutionClient.name);

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('EVOLUTION_API_URL');

    this.apiKey = this.configService.getOrThrow<string>('EVOLUTION_API_KEY');

    this.instance = this.configService.getOrThrow<string>('EVOLUTION_INSTANCE');

    this.timeout = this.configService.getOrThrow<number>(
      'EVOLUTION_REQUEST_TIMEOUT',
    );
  }

  async sendText(
    number: string,
    text: string,
  ): Promise<EvolutionSendTextResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<EvolutionSendTextResponse>(
          `${this.baseUrl}/message/sendText/${this.instance}`,
          {
            number,
            text,
          },
          {
            timeout: this.timeout,
            headers: {
              apikey: this.apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      this.logger.error(`Evolution API request failed: ${error.message}`);
      throw new EvolutionApiException(
        statusCode
          ? `Evolution API returned status ${statusCode}`
          : 'Unable to connect to Evolution API',
        statusCode,
        error.response?.data,
      );
    }
    throw error;
  }
}
