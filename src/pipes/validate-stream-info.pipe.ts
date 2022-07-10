import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { CryptoService } from 'src/services/crypto.service';

@Injectable()
export class ValidateStreamInfoPipe implements PipeTransform {

  constructor( private cryptoService: CryptoService) {}

  transform(streamFileInfo: StreamFileInfo, metadata: ArgumentMetadata): StreamFileInfo {

    if (Object.keys(streamFileInfo).length === 0) return null;

    for (const key in streamFileInfo) {
      const value = streamFileInfo[key];
      if (value === undefined || value === null) return null;
    }
    return streamFileInfo;
  }
}