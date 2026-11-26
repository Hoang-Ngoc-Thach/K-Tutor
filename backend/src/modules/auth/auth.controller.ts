import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from '../../decorator/customize';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthUser } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  @Post('register')
  @ResponseMessage('Register successfully')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successfully')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Email verified successfully')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerification.verify(dto.token);
  }

  // Always answers the same way, whether or not the email exists.
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verification email requested')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.emailVerification.resend(dto.email);
    return { requested: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get current user successfully')
  me(@Req() req: { user: AuthUser }) {
    return req.user;
  }
}
