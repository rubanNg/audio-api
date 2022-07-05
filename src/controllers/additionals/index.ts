import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
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

  // @Get("book-by-subgenre/:subgenre")
  // @ApiParam({ type: String, name: "subgenre", })
  // @ApiOkResponse({ description: 'Get book by subgenre', content: {  "application/json": {} } })
  // async getBySubGenre() {
  //   return [];
  // }
}