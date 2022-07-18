import { Controller, Get, Headers, HttpException, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response as ServerResponse } from 'express';
import { Book } from 'src/models/Book';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { ValidateStreamInfoPipe } from 'src/pipes/validate-stream-info.pipe';
import { Response } from '../../models/Response';
import { Response as Fuck } from '../../models/Response';
import { ParseService } from '../../services/parse.service';
import { UrlService } from '../../services/url.service';
import { get } from 'request';
import { StreamOffset } from 'src/models/StreamOffset';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { BookType } from 'src/models/enums/BookType';
import axios from 'axios';


@Controller("/api/books")
@ApiTags('Book')
export class BookController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}

  @ApiParam({ type: String, name: "id" })
  @ApiOkResponse({ description: 'Get book information by id', content: { "application/json": {} } })
  @Get("/:id")
  async bookInfo(@Param("id") id: string): Promise<Response<Partial<Book>>> {
    const url = this.urlService.buildBookUrl(id);
    const book = await this.parseService.parseBook(url);


    if (!book) {
      throw new HttpException({
        error: {
          message: 'Not found',
          code: 404
        }
      }, HttpStatus.NOT_FOUND);
    } else return book;
  }

  @Get("/:id/audio")
  @ApiOkResponse({ description: 'Get book audio stream', content: { 'audio/mpeg': {} } })
  @ApiNotFoundResponse({ description: "Not found", content: { "application/json": {} } })
  @ApiQuery({ name: "bookId", type: Number, required: true })
  @ApiQuery({ name: "order",  type: Number, required: true,  })
  @ApiQuery({ name: "start", type: Number, required: true })
  @ApiQuery({ name: "finish", type: Number, required: true })
  @ApiQuery({ name: "duration", type: Number, required: true })
  @ApiQuery({ name: "key", type: String, required: true  })
  @ApiQuery({ name: "server", type: String, required: true })
  @ApiQuery({ name: "title", type: String, required: true })
  async stream(@Res() res: ServerResponse, @Headers() headers: any, @Query(ValidateStreamInfoPipe) stream: StreamFileInfo)  {

    if (!stream) throw new HttpException({
      error: {
        message: 'Not found',
        code: 404
      }
    }, HttpStatus.NOT_FOUND);

    const {
      order,
      server,
      bookId,
      key,
      title,
      start,
      finish,
      fileLength
    } = stream;

    const fileOrder = order <= 9 ? `0${order}`: order;
    const url = encodeURI(`${server}/b/${bookId}/${key}/${fileOrder}. ${title}.mp3`);
    const total = await axios.head(url).then(s => +s.headers['content-length']);
    const bytesInOneSecond = total / fileLength;
    const rangeFromHeader: string = headers.range;

    if (rangeFromHeader) {;
      const parts = rangeFromHeader.replace(/bytes=/, "").split("-");
      const headerStart = parseInt(parts[0], 10);

      // + 1 к результату потомучто при сложении может получится ноль
      const streamStart = Math.trunc(start * bytesInOneSecond);
      const streamEnd = Math.trunc(finish * bytesInOneSecond) - 1;
      const streamToltal = Math.trunc((finish * bytesInOneSecond));
      const streamChunkSize = (streamEnd - streamStart);

      const offset: StreamOffset = {
        start: streamStart + headerStart + 1,
        end: streamEnd,
        total: streamToltal,
        chunksize: streamChunkSize + headerStart + 1
      }

      const rangeHeaders = {
        range: `bytes=${offset.start}-${offset.end}`
      }
      get(url, { headers: rangeHeaders }).pipe(
        res.writeHead(206, this.getHeaders(headerStart, offset))
      );

    } else {
      get(url).pipe(res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' }));
    }
  }



  private getHeaders(start: number, offset: StreamOffset) {

    const baseHeaders = {
      'Accept-Ranges': 'bytes', 
      'Content-Length': offset.chunksize,
      'Content-Type': 'audio/mpeg'
    }
    if (offset.start <= 1) {
      return {
        'Content-Range': `bytes ${start}-${offset.end}/${offset.total}`,
        ...baseHeaders
      }
    } else {
      return {
        'Content-Range': `bytes ${start}-${offset.chunksize - 1}/${offset.chunksize}`,
        ...baseHeaders
      }
    }
  }
}