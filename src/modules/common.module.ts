import { Module } from '@nestjs/common';
import { BrowserService } from 'src/services/browser.service';
import { CryptoService } from 'src/services/crypto.service';
import { ParseService } from 'src/services/parse.service';
import { UrlService } from 'src/services/url.service';

const services = [
  ParseService,
  UrlService,
  BrowserService,
  CryptoService
]

@Module({
  providers: services,
  exports: services,
})
export class CommonModule {}
