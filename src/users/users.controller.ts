import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user-dto';
import { QueryDto } from 'src/common/query/dtos/query.dto';

@Controller('users')
export class UsersController {

    constructor(
    
            private readonly usersService: UsersService,
    
        ){}
    
        @Get()
        @UseInterceptors(ClassSerializerInterceptor)
        public getAllUsers(
            @Query() queyDto: QueryDto
        ){
            return this.usersService.getAllUsers(queyDto);
        }

        @Get('{:id}')
        @UseInterceptors(ClassSerializerInterceptor)
        public getUserById(
            @Param('id',ParseIntPipe) id: number
        ){
            return this.usersService.getUserById(id);
        }

        @Post()
        public createUser(
            @Body() createUserDto: CreateUserDto,
        ){
            return this.usersService.createUser(createUserDto);
        }
    
        @Patch()
        public updateUser(
            @Body() patchUserDto: PatchUserDto,
        ){
            return this.usersService.updateUser(patchUserDto);
        }
    
        @Delete('{:id}')
        public deleteUser(
            @Param('id',ParseIntPipe) id: number
        ){
            return this.usersService.deleteUser(id);
        }
    
}
