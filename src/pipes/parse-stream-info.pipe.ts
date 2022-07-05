import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { CryptoService } from 'src/services/crypto.service';

@Injectable()
export class ParseStreamInfoPipe implements PipeTransform {

  constructor( private cryptoService: CryptoService) {}

  transform(value: string, metadata: ArgumentMetadata): StreamFileInfo {
    try {
      const data = JSON.parse(this.cryptoService.decodeFromBase64(value)) as StreamFileInfo;
      data.title = decodeURI(data.title);
      return data;
    } catch {
      return null
    }
  }
}