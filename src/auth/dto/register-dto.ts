import { IsEmail, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordMatchingConstarint } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsEmail()
    @ApiProperty()
    email: string;
    @IsString()
    @MinLength(6)
    @ApiProperty()
    password: string;
    @IsString()
    @MinLength(6)
    @Validate(IsPasswordMatchingConstarint)
    @ApiProperty()
    passwordRepeat: string;
}
