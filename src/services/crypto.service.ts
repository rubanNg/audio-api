import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {

  encodeToBase64(value: any) {
    return Buffer.from(JSON.stringify(value)).toString('base64');
  }

  decodeFromBase64(value: string) {
    return Buffer.from(value, 'base64').toString('ascii');
  }
}