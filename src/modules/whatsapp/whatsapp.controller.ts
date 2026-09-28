import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { sendTextSchema } from './dto/send-text.dto';
import type { SendTextDto } from './dto/send-text.dto';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('messages/text')
  async sendText(
    @Body(new ZodValidationPipe(sendTextSchema))
    body: SendTextDto,
  ) {
    return this.whatsappService.sendText(body.number, body.text);
  }

  @Get('messages/:id')
  async findMessage(@Param('id') id: string) {
    return this.whatsappService.findMessage(id);
  }
}
