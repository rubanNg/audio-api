import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Books } from "src/models/Books";
import { BookType } from "src/models/enums/BookType";
import { Period } from "src/models/enums/Period";
import { TopBooksQuery } from "src/models/TopBooksQuery";
import { ParseTopBooksQueryPipe } from "src/pipes/parse-top-books-query.pipe";
import { ParseService } from "src/services/parse.service";
import { UrlService } from "src/services/url.service";
import { Response } from '../../models/Response';

@Controller("/api/top")
@ApiTags("Top")
export class TopController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}

  @Get("/")
  @ApiQuery({ name: "page", type: Number, required: false })
  @ApiQuery({ name: "period", required: false, enum: Period,  })
  @ApiQuery({ name: "genre", type: String, required: false })
  @ApiQuery({ name: "type", enum: BookType, required: false })
  async getTopNovels(@Query(ParseTopBooksQueryPipe) query: TopBooksQuery): Promise<Response<Books>> {
    const url = this.urlService.buildTopBooksUrls(query);
    return await this.parseService.parseBooksList(url);
  }
}