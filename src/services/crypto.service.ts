import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {

  encodeToBase64(value: string) {
    return Buffer.from(value).toString('base64');
  }

  decodeFromBase64(value: string) {
    return Buffer.from(value, 'base64').toString('ascii');
  }
}