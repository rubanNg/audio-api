import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { CryptoService } from 'src/services/crypto.service';

@Injectable()
export class ParseStreamInfoPipe implements PipeTransform {

  constructor( private cryptoService: CryptoService) {}

  transform(streamFileInfo: StreamFileInfo, metadata: ArgumentMetadata): StreamFileInfo {
    for (const key in streamFileInfo) if (!streamFileInfo[key]) return null;
    return streamFileInfo;
  }
}