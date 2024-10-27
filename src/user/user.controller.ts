import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() dto) {
        return this.userService.create(dto);
    }

    @Get(':idOrEmail')
    findOneUser(@Param('idOrEmail') idOrEmail: string) {
        return this.userService.findOne(idOrEmail);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.userService.delete(id);
    }
}
