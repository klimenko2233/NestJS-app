import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {IsEmailUniqueConstraint} from './auth/validators/is-email-unique.validator';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const dbHost = configService.get<string>('DB_HOST');
                const dbPort = configService.get<number>('DB_PORT');
                const dbUsername = configService.get<string>('DB_USERNAME');
                const dbPassword = configService.get<string>('DB_PASSWORD');
                const dbName = configService.get<string>('DB_NAME');

                if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
                    throw new Error('Database configuration is incomplete');
                }

                return {
                    type: 'postgres',
                    host: dbHost,
                    port: dbPort,
                    username: dbUsername,
                    password: dbPassword,
                    database: dbName,
                    autoLoadEntities: true,
                    synchronize: configService.get<string>('NODE_ENV') !== 'production',
                };
            },
        }),

        TasksModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [AppService, IsEmailUniqueConstraint]
})
export class AppModule {}