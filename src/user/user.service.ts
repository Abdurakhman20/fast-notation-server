import { IJwtPayload } from '@auth/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { Cache } from 'cache-manager';
import { genSaltSync, hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { convertToSecondsUtil } from '@common/utils';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {}

    async create(user: Partial<User>) {
        const hashedPassword = this.hashPassword(user.password);
        const createdUser = await this.prismaService.user.upsert({
            where: {
                email: user.email,
            },
            update: {
                password: hashedPassword ?? undefined,
                roles: user?.roles ?? undefined,
            },
            create: {
                email: user.email,
                password: hashedPassword,
                roles: ['USER'],
            },
        });

        await this.cacheManager.set(createdUser.id, createdUser);
        await this.cacheManager.set(createdUser.email, createdUser);

        return createdUser;
    }
    async findOne(idOrEmail: string, isReset = false) {
        if (isReset) {
            await this.cacheManager.del(idOrEmail);
        }
        const cachedUser = await this.cacheManager.get<User>(idOrEmail);
        if (!cachedUser) {
            const user = await this.prismaService.user.findFirst({
                where: {
                    OR: [{ id: idOrEmail }, { email: idOrEmail }],
                },
            });
            if (!user) {
                return null;
            }
            await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')));
            return user;
        }
        return cachedUser;
    }
    async delete(id: string, user: IJwtPayload) {
        if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
            throw new ForbiddenException();
        }
        await Promise.all([this.cacheManager.del(id), this.cacheManager.del(user.email)]);
        return this.prismaService.user.delete({
            where: {
                id,
            },
            select: { id: true },
        });
    }

    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }
}
