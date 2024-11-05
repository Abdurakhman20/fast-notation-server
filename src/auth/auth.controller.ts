import {
    Body,
    Controller,
    Post,
    Get,
    BadRequestException,
    UnauthorizedException,
    Res,
    HttpStatus,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto';
import { AuthService } from './auth.service';
import { ITokens } from './interfaces';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, Public, UserAgent } from '@common/decorators';
import { UserResponse } from '@user/responses';
import { ApiAcceptedResponse, ApiCreatedResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

const REFRESH_TOKEN = 'refreshtoken';

@Public()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    @ApiOperation({ summary: 'Register user' })
    @ApiResponse({
        status: 200,
        description: 'Register user',
        type: UserResponse,
        example: {
            id: '682b8a37-948d-40e7-a7cd-878991bcfb58',
            email: 'test.example@gmail.com',
            imageUrl: '',
            createdAt: '2024-11-05T18:45:07.747Z',
            updatedAt: '2024-11-05T18:45:07.747Z',
            roles: ['USER'],
        },
    })
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        if (!user) {
            throw new BadRequestException(`Не получается зарегистрировать пользователя с данными ${JSON.stringify(dto)}`);
        }

        return new UserResponse(user);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({
        status: 200,
        description: 'Login user',
        example: {
            accessToken:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmI4YTM3LTk0OGQtNDBlNy1hN2NkLTg3ODk5MWJjZmI1OCIsImVtYWlsIjoidGVzdC5leGFtcGxlQGdtYWlsLmNvbSIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzMwODMyNDM0LCJleHAiOjE3MzA5MTg4MzR9.BOikaJPHGvLkjxgKq9GArgasyH48svnWtxM_jM9tbN4',
        },
    })
    async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() userAgent: string) {
        console.log(userAgent);
        const tokens = await this.authService.login(dto, userAgent);
        if (!tokens) {
            throw new BadRequestException(`Не получается войти с данными ${JSON.stringify(dto)}`);
        }

        this.setRefreshTokenToCookies(tokens, res);
    }

    @Get('logout')
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({
        status: 200,
        description: 'Logout user response',
        example: 'OK',
    })
    async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
        if (!refreshToken) {
            res.sendStatus(HttpStatus.OK);
            return;
        }
        await this.authService.deleteRefreshToken(refreshToken);
        res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
        res.sendStatus(HttpStatus.OK);
    }

    @Get('refresh-tokens')
    @ApiOperation({ summary: 'Refresh tokens' })
    @ApiCreatedResponse({
        description: 'Refresh-tokens success response',
        example: {
            accessToken:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmI4YTM3LTk0OGQtNDBlNy1hN2NkLTg3ODk5MWJjZmI1OCIsImVtYWlsIjoidGVzdC5leGFtcGxlQGdtYWlsLmNvbSIsInJvbGVzIjpbIlVTRVIiXSwiaWF0IjoxNzMwODMyNzY5LCJleHAiOjE3MzA5MTkxNjl9.sXo5gBFsufN_2DM7_SaUz6nlfrY-2mpupXo1vdq6fZY',
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Refresh-tokens bad response',
        example: {
            message: 'Unauthorized',
            statusCode: 401,
        },
    })
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() userAgent: string) {
        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const tokens = await this.authService.refreshToken(refreshToken, userAgent);
        if (!tokens) {
            throw new UnauthorizedException();
        }
        this.setRefreshTokenToCookies(tokens, res);
    }

    private setRefreshTokenToCookies(tokens: ITokens, res: Response) {
        if (!tokens) {
            throw new UnauthorizedException();
        }

        res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path: '/',
        });

        res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
    }
}
