import { Injectable } from '@nestjs/common';
import { enc, AES } from "crypto-js";

@Injectable()
export class CryptoService {

  encodeToBase64(value: any) {
    return Buffer.from(JSON.stringify(value)).toString('base64');
  }

  decodeFromBase64(value: string) {
    return Buffer.from(value, 'base64').toString('ascii');
  }

  encryptHash(liveKey: string) {
    const encrypted = AES.encrypt(`"${liveKey}"`, "EKxtcg46V");

    const ct = encrypted.ciphertext.toString(enc.Base64);
    const iv = encrypted.iv.toString();
    const s = encrypted.salt.toString();

    const values = {
      ct: ct,
      iv: iv,
      s: s
    };

    return encodeURIComponent(JSON.stringify(values));
  }
}