import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  // No MinLength here: a wrong password must return 401, not a 400 that
  // reveals the password policy.
  @IsString()
  @IsNotEmpty()
  password: string;
}
