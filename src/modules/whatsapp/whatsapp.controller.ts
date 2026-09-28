import { BadRequestException, Body, Controller, Post } from '@nestjs/common';

import { WhatsappService } from './whatsapp.service';
import { sendTextSchema } from './dto/send-text.dto';
import type { SendTextDto } from './dto/send-text.dto';


@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('messages/text')
  async sendText(@Body() body: SendTextDto) {
    const result = sendTextSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return this.whatsappService.sendText(result.data.number, result.data.text);
  }
}
