import { ClassSerializerInterceptor, Controller, Delete, Get, Param, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { CurrentUser } from '@common/decorators';
import { IJwtPayload } from '@auth/interfaces';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.findOne(idOrEmail);
        return new UserResponse(user);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Delete(':id')
    async deleteUser(@Param('id') id: string, @CurrentUser() user: IJwtPayload) {
        return this.userService.delete(id, user);
    }
}
