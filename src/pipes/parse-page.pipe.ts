import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { LatestQuery } from 'src/models/LatestQuery';

@Injectable()
export class ParseLatestQuryPipe implements PipeTransform {
  transform(value: LatestQuery, metadata: ArgumentMetadata) {
    if (!value.page || isNaN(Number(value.page))) value.page = 1;
    return value;
  }
}