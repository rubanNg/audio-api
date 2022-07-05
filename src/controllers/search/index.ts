import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Books } from "src/models/Books";
import { SearchQuery } from "src/models/SearchQuery";
import { ParseService } from "src/services/parse.service";
import { UrlService } from "src/services/url.service";
import { Response } from '../../models/Response';

@Controller("/api")
@ApiTags("Search")
export class Searchontroller {
  constructor(private parseService: ParseService, private urlService: UrlService) {}


  @Get("/search")
  @ApiQuery({ name: "page", type: Number, required: false })
  @ApiQuery({ name: "value", type: String,  required: true  })
  async search(@Query() { page, value }: SearchQuery): Promise<Response<Books>> {

    if (!value) return ({ data: [] });
    if (!page) page = 1;

    const url = this.urlService.buildSearchUrl({ page, value: decodeURI(value) });
    return await this.parseService.parseBooksList(url);
  }


}