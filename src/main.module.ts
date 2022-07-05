import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdditionalsController } from './controllers/additionals';
import { BookController } from './controllers/book';
import { IndexController } from './controllers/index';
import { LatestController } from './controllers/latest';
import { Searchontroller } from './controllers/search';
import { TopController } from './controllers/top';
import { CommonModule } from './modules/common.module';

@Module({
  imports: [
    CommonModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public')
    }),
  ],
  controllers: [
    LatestController,
    BookController,
    TopController,
    AdditionalsController,
    Searchontroller,
    IndexController
  ],
})
export class MainModule {}
