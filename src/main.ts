import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { join } from 'path'
import { readFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  const app =  await NestFactory.create<NestExpressApplication>(MainModule, {
    httpsOptions: {
      key: readFileSync(join(__dirname, "../public/ssl/key.pem")),
      cert: readFileSync(join(__dirname, "../public/ssl/certificate.pem")),
    }
  });

  const config = new DocumentBuilder().setTitle('Books').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);


  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('html');

  const host = process.env.HOST || '0.0.0.0';
  
  
  await app.listen(process.env.PORT || 8080, host, () => {
    console.log(`=> started on https://${host}:${process.env.PORT || 8080}`)
  });
}
bootstrap();


