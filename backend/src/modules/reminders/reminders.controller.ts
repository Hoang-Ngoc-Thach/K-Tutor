import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { RemindersService } from './reminders.service';

// Public on purpose: the link in the email must work without logging in.
// The signed token proves which learner it belongs to.
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Unsubscribed from study reminders successfully')
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.remindersService.unsubscribe(dto.token);
  }
}
