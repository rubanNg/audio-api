import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookType } from 'src/models/enums/BookType';
import { LatestQuery } from 'src/models/LatestQuery';
import { ParseLatestQuryPipe } from 'src/pipes/parse-page.pipe';
import { Books } from '../../models/Books';
import { Response } from '../../models/Response';
import { ParseService } from '../../services/parse.service';
import { UrlService } from '../../services/url.service';

@Controller("/api/latest")
@ApiTags("Latest")
export class LatestController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}


  @Get("/")
  @ApiQuery({ name: "page", type: Number, required: false })
  @ApiQuery({ name: "type", required: false, enum: BookType,  })
  async latest(@Query(ParseLatestQuryPipe) query: LatestQuery): Promise<Response<Books>> {
    const url = this.urlService.buildLatestUrl({ type: query.type, page: query.page });
    return await this.parseService.parseBooksList(url);
  }
}
