import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import type { EnvironmentVariables } from '../../../config/env.types';
import { EvolutionApiException } from '../exceptions/evolution-api.exception';
import type { EvolutionSendTextResponse } from '../types/evolution-message.types';

@Injectable()
export class EvolutionClient {
  private readonly logger = new Logger(EvolutionClient.name);

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.baseUrl = this.configService.getOrThrow('EVOLUTION_API_URL');
    this.apiKey = this.configService.getOrThrow('EVOLUTION_API_KEY');
    this.instance = this.configService.getOrThrow('EVOLUTION_INSTANCE');
    this.timeout = this.configService.getOrThrow('EVOLUTION_REQUEST_TIMEOUT');
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
