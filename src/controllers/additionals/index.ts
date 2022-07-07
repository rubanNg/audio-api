import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { Books } from "src/models/Books";
import { BooksSeries } from "src/models/BooksSeries";
import { Response } from "src/models/Response";
import { ParseService } from "src/services/parse.service";
import { UrlService } from "src/services/url.service";

@Controller("/api")
@ApiTags('Additionals')
export class AdditionalsController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}


  @Get("/genres-list")
  @ApiOkResponse({ description: 'Get genres', content: { "application/json": {} } })
  async genres() {
    const url = this.urlService.buildAdditionalsUrls().genres;
    return await this.parseService.parseGenres(url);
  }


  @Get("/series/:seriesId")
  @ApiOkResponse({ description: 'Get series', content: { "application/json": {} } })
  async sesries(@Param("seriesId") seriesId: string): Promise<Response<Books>> {
    const url = this.urlService.buidlSeriesUrl(seriesId);
    return await this.parseService.parseBooksList(url);
  }
}