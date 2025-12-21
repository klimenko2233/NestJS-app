import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {useContainer} from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: false
    }));

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);}
bootstrap();