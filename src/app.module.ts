import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {TasksModule} from './tasks/tasks.module';

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
      TasksModule
  ]
})
export class AppModule {}
