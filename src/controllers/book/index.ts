import { Controller, Get, Headers, HttpException, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response as ServerResponse } from 'express';
import { Book } from 'src/models/Book';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { ParseStreamInfoPipe } from 'src/pipes/parse-stream-info.pipe';
import { Response } from '../../models/Response';
import { Response as Fuck } from '../../models/Response';
import { ParseService } from '../../services/parse.service';
import { UrlService } from '../../services/url.service';
import { get } from 'request';
import { StreamOffset } from 'src/models/StreamOffset';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { BookType } from 'src/models/enums/BookType';
import axios from 'axios';


@Controller("/api")
@ApiTags('Book')
export class BookController {
  constructor(private parseService: ParseService, private urlService: UrlService) {}

  @ApiParam({ type: String, name: "id" })
  @ApiOkResponse({ description: 'Get book information by id', content: { "application/json": {} } })
  @Get("book/:id")
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

  @Get("book/audio/:streamConfig")
  @ApiParam({ type: String, name: "stream configuration", })
  @ApiOkResponse({ description: 'Get book audio stream', content: { 'audio/mpeg': {} } })
  @ApiNotFoundResponse({ description: "Not found", content: { "application/json": {} } })
  async stream(@Res() res: ServerResponse, @Headers() headers: any, @Param('streamConfig', ParseStreamInfoPipe) stream: StreamFileInfo)  {


    if (!stream) throw new HttpException({
      error: {
        message: 'Not found',
        code: 404
      }
    }, HttpStatus.NOT_FOUND);


    const url = await this.parseService.getAudioStreamUrl(stream);
    const total = await axios.head(url).then(s => +s.headers['content-length']);
    const bytesInOneSecond = total / stream.fileLength;
  
    const rangeFromHeader = headers.range;

    if (rangeFromHeader) {;
      const parts = rangeFromHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);

      // + 1 к результату потомучто при сложении может получится ноль
      const streamStart = Math.trunc(stream.start * bytesInOneSecond);
      const streamEnd = Math.trunc(stream.finish * bytesInOneSecond) - 1;
      const streamToltal = Math.trunc((stream.finish * bytesInOneSecond));
      const streamChunkSize = (streamEnd - streamStart);

      const offset: StreamOffset = {
        start: streamStart + start + 1,
        end: streamEnd,
        total: streamToltal,
        chunksize: streamChunkSize + start + 1
      }

      const rangeHeaders = {
        range: `bytes=${offset.start}-${offset.end}`
      }
      get(url, { headers: rangeHeaders }).pipe(
        res.writeHead(206, this.getHeaders(start, offset))
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