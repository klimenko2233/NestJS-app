import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {TasksModule} from './tasks/tasks.module';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {AppController} from './app.controller';
import {AppService} from './app.service';

@Module({
  imports: [
      TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'secretpassword',
          database: 'tasks_db',
          autoLoadEntities: true,
          synchronize: true
      }),
      TasksModule,
      AuthModule,
      UsersModule
  ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
