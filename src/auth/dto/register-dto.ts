import { IsEmail, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordMatchingConstarint } from '@common/decorators';

export class RegisterDto {
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(6)
    password: string;
    @IsString()
    @MinLength(6)
    @Validate(IsPasswordMatchingConstarint)
    passwordRepeat: string;
}
