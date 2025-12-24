import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const corsOrigin = configService.get('CORS_ORIGIN');
    if (corsOrigin) {
        app.enableCors({
            origin: corsOrigin,
            credentials: true,
        });
    } else if (configService.get('NODE_ENV') === 'development') {
        app.enableCors();
    }

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    console.log(`Application running in ${configService.get('NODE_ENV')} mode`);
    console.log(`Listening on port ${port}`);
}
bootstrap();