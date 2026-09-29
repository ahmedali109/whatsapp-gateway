import { Body, Controller, Post } from '@nestjs/common';

import { EvolutionWebhookService } from './evolution-webhook.service';

@Controller('webhooks/evolution')
export class EvolutionWebhookController {
  constructor(private readonly webhookService: EvolutionWebhookService) {}

  @Post()
  handleWebhook(@Body() payload: unknown) {
    return this.webhookService.handle(payload);
  }
}
