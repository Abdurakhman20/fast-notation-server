import { IsEmail, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordMatchingConstarint } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @IsEmail()
    @ApiProperty()
    email: string;
    @ApiProperty()
    @IsString()
    firstname: string;
    @ApiProperty()
    @IsString()
    lastname: string;
    @ApiProperty()
    @IsString()
    username: string;
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
