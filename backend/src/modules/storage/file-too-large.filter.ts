import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class FileTooLargeExceptionFilter implements ExceptionFilter<PayloadTooLargeException> {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      message: 'FILE_TOO_LARGE',
      error: 'Payload Too Large',
    });
  }
}
