import { Module } from '@nestjs/common';
import { CryptoService } from 'src/services/crypto.service';
import { ParseService } from 'src/services/parse.service';
import { UrlService } from 'src/services/url.service';

const services = [
  ParseService,
  UrlService,
  CryptoService
]

@Module({
  providers: services,
  exports: services,
})
export class CommonModule {}
