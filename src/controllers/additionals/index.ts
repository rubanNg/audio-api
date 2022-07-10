import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Books } from "src/models/Books";
import { BooksSeries } from "src/models/BooksSeries";
import { Response } from "src/models/Response";
import { ParseService } from "src/services/parse.service";
import { UrlService } from "src/services/url.service";

@Controller("/api/additionals")
@ApiTags('Additionals')
export class AdditionalsController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}


  @Get("/genres")
  @ApiOkResponse({ description: 'Genres list', content: { "application/json": {} } })
  async genres() {
    const url = this.urlService.buildAdditionalsUrls().genres;
    return await this.parseService.parseGenres(url);
  }


  @Get("/series/:seriesId")
  @ApiOkResponse({ description: 'Series by id', content: { "application/json": {} } })
  async sesrie(@Param("seriesId") seriesId: string): Promise<Response<Books>> {
    const url = this.urlService.buidlSerieUrl(seriesId);
    return await this.parseService.parseBooksList(url);
  }

  @Get("/author-prefixes")
  @ApiOkResponse({ description: 'Author prefixes', content: { "application/json": {} } })
  async prefexies(): Promise<string[]> {
    const url = this.urlService.buildAuthorsUrl();
    return this.parseService.parseAuthorPrefixes(url)
  }

  @Get("/authors")
  @ApiOkResponse({ description: 'Author by prefix or search string', content: { "application/json": {} } })
  @ApiQuery({ name: "prefix", required: false, type: String, description: "author prefix" })
  @ApiQuery({ 
    name: "search-string", 
    required: false, 
    type: String, 
    description: "if the search string has a value, then the prefix is ignored" 
  })
  async author(@Query("prefix") prefix: string, @Query("search-string") searchString: string) {
    const url = this.urlService.buildAuthorsUrl(prefix);
    return await this.parseService.parseAuthorsList(url, searchString);
  }
}