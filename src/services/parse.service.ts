import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parse as parseHtml, HTMLElement } from 'fast-html-parser';
import { Book } from 'src/models/Book';
import { Books } from 'src/models/Books';
import { Pagination } from 'src/models/Pagination';
import { BrowserService } from './browser.service';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { CryptoService } from './crypto.service';
import { BookIInfoFromExternalServer } from 'src/models/BookInfoFromExternalServer';
import { BookItemsFromExternalServer } from 'src/models/BookItemsFromExternalServer';
import { Response } from 'src/models/Response';

@Injectable()
export class ParseService {

  constructor(private browserService: BrowserService, private cryptoService: CryptoService) {}

  async parseBooksList(url: string) {
    const books: Books = []
    console.log({ url })
    const html = await this.getPageHtml(url);
    const document = parseHtml(html);
    const elements = document.querySelectorAll(".content__main__articles--item");

    for (const element of elements) {
      const query = element.querySelector.bind(element);
      const book: Partial<Book> = {
        poster: query("img")?.attributes?.src,
        author: {
          name: query('.link__action a')?.text?.trim(),
          id: '',
        },
        description: query('.description__article-main')?.lastChild?.text?.trim(),
        name: query("img")?.attributes?.alt?.trim(),
        id: this.splitStringByDelimiter(query('.content__article-main-link')?.attributes?.href, "/").pop(),
        genres: this.splitStringByDelimiter(query(".articles__item--topline a")?.text?.trim(), ","),
      };
      books.push(book);
    }

    return {
      data: books,
      pagination: this.parsePagination(document)
    };
  }

  async parseBook(url: string): Promise<Response<Partial<Book>>> {

    if (await this.isNotValidPage(url)) {
      return null;
    }

    const { html, response: bookInfo } = await this.browserService.getPageHtml(url, async (response) => {
      return response.url().includes("/ajax/b/");
    });

    const document = parseHtml(html);
    bookInfo.bid = document.querySelector(".ls-topic")?.attributes?.['data-bid'];

    const book: Partial<Book> = {
      poster: document.querySelector('.cover__wrapper--image img')?.attributes?.src,
      genres: this.splitStringByDelimiter(document.querySelector(".section__title")?.text?.trim(), ","),
      author: {
        name: document.querySelector(".link__author span")?.text?.trim(),
        id: "",
      },
      description: document.querySelector(".description__article-main")?.text?.trim(),
      name: document.querySelector(".caption__article-title")?.text?.trim(),
      auidio: await this.getBookStreamsUrls(bookInfo)
    }
    return {
      data: book
    };
  }

  async parseGenres(url: string) {
    const html = await this.getPageHtml(url);
    const document = parseHtml(html);
    const rows = document.querySelectorAll(".table-authors tr");

    const result = [];

    for (const row of rows) {
      const link = row.querySelector('h4 a.name');
      const item = {
        name: link?.text?.trim(),
        id: this.splitStringByDelimiter(link?.attributes?.href, "/").pop()?.trim(),
        subgenres: row?.querySelectorAll(".description--links a").map(a => ({ 
          name: a?.text.trim(), 
          id: this.splitStringByDelimiter(a.attributes?.href, "/")?.pop()
        }))
      }
      if (item.name) result.push(item)
    }

    return result;
  }

  async getAudioStreamUrl(info: StreamFileInfo) {
    const order = info.order <= 9 ? `0${info.order}`: info.order;
    return encodeURI(`${info.server}/b/${info.bookId}/${info.key}/${order}. ${info.title}.mp3`);

  }

  private async getPageHtml(url: string) {
    return (await axios.get<string>(encodeURI(url))).data;
  }

  private splitStringByDelimiter(string: string, delimiter: string) {
    if (!string) return [];
    const array = string.split(delimiter).filter(value => value);
    return array.map(value => value.trim())
  }

  private parsePagination(element: HTMLElement): Pagination {
    const page = +element.querySelectorAll(".page__nav--standart--active").filter(s => {
      return s?.text?.trim() !== "...";
    }).pop()?.text?.trim();
    const tolalPages = +element.querySelectorAll('.page__nav--standart').pop()?.text?.trim();
    const nextPage = tolalPages < page ? null : page + 1;


    return {
      page,
      nextPage,
      tolalPages: tolalPages < page ? page : tolalPages
    }
  }

  private async getBookStreamsUrls(bookInfo:BookIInfoFromExternalServer & { bid: string }) {
    const items: BookItemsFromExternalServer[] = JSON.parse(bookInfo.items);
    const server = bookInfo.srv;
    const bookId = +bookInfo.bid;
    const key = bookInfo.key;
    const title = bookInfo.title;
    const result: { title: string, stream: string }[] = [];
    const filesIds = new Set<number>(items.map(s => s.file));


    for (const fileId of filesIds) {
      const itemsForId = items.filter(s => s.file == fileId);

      const fileUrl = encodeURI(`${server}b/${bookId}/${key}/0${fileId}. ${title}.mp3`);

      for (const item of itemsForId) {

        const streamInfo: StreamFileInfo = {} as StreamFileInfo;
        streamInfo.fileLength = 0;
        streamInfo.bookId = bookId,
        streamInfo.fileLength = itemsForId.reduce((p, n) => p + n.duration, 0);
        streamInfo.fileBytes = await this.getContentLength(fileUrl);
        streamInfo.order = fileId;
        streamInfo.start = item.time_from_start;
        streamInfo.finish = item.time_finish;
        streamInfo.duration = item.duration;
        streamInfo.key = key;
        streamInfo.server = server;
        streamInfo.title = encodeURI(title);

        result.push({
          title: item.title,
          stream: this.cryptoService.encodeToBase64(JSON.stringify(streamInfo))
        })
      }
    }
    return result;
  }

  private async getContentLength(url: string) {
    return await axios.head(url).then(s => +s.headers['content-length']);
  }

  private async isNotValidPage(url: string) {
    try {
      return (await axios.head(url)).status === 404;
    } catch {
      return true;
    }
  }
}
