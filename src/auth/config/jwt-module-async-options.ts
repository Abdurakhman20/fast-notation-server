import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => ({
    secret: config.get('JWT_SECRET'),
    global: true,
    signOptions: {
        expiresIn: config.get('JWT_EXP', '1d'),
    },
});

export const options = (): JwtModuleAsyncOptions => ({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => jwtModuleOptions(config),
});
