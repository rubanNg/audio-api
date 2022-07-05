import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { TopBooksQuery } from 'src/models/TopBooksQuery';
import { Period } from 'src/models/Period';

@Injectable()
export class ParseTopBooksQueryPipe implements PipeTransform {
  transform(value: TopBooksQuery, metadata: ArgumentMetadata) {
    if (!value.page) value.page = 1;
    if (!Period[value.period]) value.period = Period.Week;
    else value.period = Period[value.period];
    return value;
  }
}