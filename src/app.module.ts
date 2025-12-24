import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IsEmailUniqueConstraint } from './auth/validators/is-email-unique.validator';
import { HealthModule } from './health/health.module';
import * as Joi from 'joi';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
                PORT: Joi.number().default(3000),
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().default(5432),
                DB_USERNAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_NAME: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRES_IN: Joi.string().default('24h'),
                LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error', 'verbose').default('info'),
                CORS_ORIGIN: Joi.string().uri().optional(),
            }),
            validationOptions: { abortEarly: true }
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
                    synchronize: false,
                };
            },
        }),

        TasksModule,
        AuthModule,
        UsersModule,
        HealthModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        IsEmailUniqueConstraint,
    ],
})
export class AppModule {}