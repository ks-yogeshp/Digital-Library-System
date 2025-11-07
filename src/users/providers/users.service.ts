import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryProvider } from 'src/common/query/providers/query.provider';
import { QueryDto } from 'src/common/query/dtos/query.dto';

@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name);
    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly queryProvider: QueryProvider,
    ){}

    public async getAllUsers(queryDto:QueryDto){
        try {
            return await this.queryProvider.query({
                query:queryDto,
                repository:this.userRepository,
                relations:{
                    borrowingHistory:true,
                    reservationHistory: true
                }
            });
        } catch (error) {
            this.logger.error('Error fetching users', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async getUserById(id: number){
        try {
            return await this.userRepository.findOne({
                where:{
                    id: id
                }
                ,relations:{
                    borrowingHistory:true,
                    reservationHistory:true
                }
            });
        } catch (error) {
            this.logger.error('Error fetching users', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async createUser(createUserDto: CreateUserDto){

        try {
            const existingUser = await this.userRepository.findOneBy({
                email: createUserDto.email,
            });
    
            if (existingUser) {
                throw new BadRequestException('User already exists with this email');
            }
    
            const newUser = this.userRepository.create(createUserDto);
            return await this.userRepository.save(newUser);
    
        } catch (error) {
            this.logger.error('Error creating user', error.stack);
            throw new InternalServerErrorException({
                message: 'Error creating the user',
                details: error.message,
            });
        }

    }

    public async updateUser(patchUserDto: PatchUserDto){

        let existingUser: User | null; 
        try {
            existingUser = await this.userRepository.findOneBy({ id: patchUserDto.id });
    
            if (!existingUser) {
                throw new NotFoundException('User does not exist with this Id');
            }
    
            existingUser.firstName = patchUserDto.firstName ?? existingUser.firstName;
            existingUser.lastName = patchUserDto.lastName ?? existingUser.lastName;
    
            return await this.userRepository.save(existingUser);
    
        } catch (error) {
            this.logger.error('Error updating user', error.stack);
            throw new InternalServerErrorException({
                message: 'Error updating the user',
                details: error.message,
            });
        }
        
    }

    public async deleteUser(id:number){
        try {
            const result = await this.userRepository.delete(id);
    
            if (result.affected === 0) {
                throw new NotFoundException('User does not exist with this Id');
            }
    
            return { message: 'User deleted successfully' };
    
        } catch (error) {
            this.logger.error('Error deleting user', error);
            throw new InternalServerErrorException({
                message: 'An error occurred while deleting the user',
                details: error.message,
            });
        }
    }

}
