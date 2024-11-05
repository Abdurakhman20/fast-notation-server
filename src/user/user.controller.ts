import { ClassSerializerInterceptor, Controller, Delete, Get, Param, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { CurrentUser } from '@common/decorators';
import { IJwtPayload } from '@auth/interfaces';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    @ApiOperation({ summary: 'Find one user' })
    @ApiResponse({
        status: 200,
        description: 'The found record',
        type: UserResponse,
        example: {
            id: '323e5ca7-bd7c-40a7-a73e-39d8bc61a128',
            email: 'test.example@gmail.com',
            imageUrl: '',
            createdAt: '2024-10-29T21:42:24.493Z',
            updatedAt: '2024-10-29T21:42:24.493Z',
            roles: ['USER'],
        },
    })
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.findOne(idOrEmail);
        return new UserResponse(user);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({
        status: 200,
        description: 'The deleted user Id',
        example: {
            id: '323e5ca7-bd7c-40a7-a73e-39d8bc61a128',
        },
    })
    async deleteUser(@Param('id') id: string, @CurrentUser() user: IJwtPayload) {
        return this.userService.delete(id, user);
    }
}
