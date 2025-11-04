import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './providers/authors.service';
import { QueryModule } from 'src/common/query/query.module';

@Module({
    imports:[
        TypeOrmModule.forFeature([Author]),
        QueryModule
    ],
    controllers: [AuthorsController],
    providers: [AuthorsService]
})
export class AuthorsModule {}
