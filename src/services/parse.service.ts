import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parse as parseHtml, HTMLElement } from 'fast-html-parser';
import { AudioInfo, Book } from 'src/models/Book';
import { Books } from 'src/models/Books';
import { Pagination } from 'src/models/Pagination';
import { StreamFileInfo } from 'src/models/StreamInfo';
import { CryptoService } from './crypto.service';
import { BookIInfoFromExternalServer } from 'src/models/BookInfoFromExternalServer';
import { BookItemsFromExternalServer } from 'src/models/BookItemsFromExternalServer';
import { Response } from 'src/models/Response';
import { UrlService } from './url.service';

@Injectable()
export class ParseService {


  private headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'cookie': null
  };

  constructor(private cryptoService: CryptoService, private urlService: UrlService) {}

  async parseBooksList(url: string) {

    const books: Books = []
    const { data: html } = await this.loadPage(url);
    const document = parseHtml(html);
    const elements = document.querySelectorAll(".content__main__articles--item");

    for (const element of elements) {
      const query = element.querySelector.bind(element);
      const book: Partial<Book> = {
        poster: query("img")?.attributes?.src,
        author: {
          name: query('.link__action a')?.text?.trim(),
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

    const { headers: { "set-cookie": cookie }, data: html } = await this.loadPage(url);
    const hash = this.cryptoService.encryptHash(this.secutiryKey(html));
    const document = parseHtml(html);
    const bookId = document.querySelector(".ls-topic")?.attributes?.['data-bid'];

    const headers = {
      ...this.headers,
      'cookie': cookie[0]
    }

    const body = `bid=${bookId}&hash=${hash}&security_ls_key=${this.secutiryKey(html)}`;
    const dataFromServer = (await axios.post(`${this.urlService.baseUrl}/ajax/b/${bookId}`, body, { headers })).data;

    const bookInfo = {
      ...dataFromServer,
      bid: bookId,
      items: JSON.parse(dataFromServer.items),
      stringBookId: this.splitStringByDelimiter(dataFromServer.bookurl, "/").pop(),
    };

    const book: Partial<Book> = {
      poster: document.querySelector('.cover__wrapper--image img')?.attributes?.src,
      genres: this.splitStringByDelimiter(document.querySelector(".section__title")?.text?.trim(), ","),
      author: {
        name: document.querySelector(".link__author span")?.text?.trim(),
        id: decodeURI(this.splitStringByDelimiter(document.querySelector(".link__author")?.attributes?.href, "/").pop()),
      },
      description: document.querySelector(".description__article-main")?.text?.trim(),
      name: document.querySelector(".caption__article-title")?.text?.trim(),
      auidio: await this.getBookStreams(bookInfo),
      relatedBooks: this.getRelatedBooks(document),
      series: this.getSeries(document)
    }

    return {
      data: book
    };
  }

  async parseAuthorsList(url: string, searchString: string = null) {
    
    const getHtml = (html: string)  => {
      const document = parseHtml(html);
      const rows = document.querySelectorAll('tr');

      return rows.map(item => {
        return {
          name: item.querySelector("td h4 a")?.text?.trim(),
          id: this.splitStringByDelimiter(item.querySelector("h4 a").attributes.href, "/").pop(),
          booksCount: this.splitStringByDelimiter(item.querySelector("td .description")?.text, " ")?.shift()?.trim(),
        }
      });
    }

    if (searchString) {
      
      const { data: html, headers: { "set-cookie": cookie } } = await this.loadPage(decodeURI(url));

      const headers = {
        ...this.headers,
        'cookie': cookie[0]
      }
      
      const body = `sText=${searchString}&isPrefix=${0}&security_ls_key=${this.secutiryKey(html)}`;
      const searchResult = (await axios.post(`${this.urlService.baseUrl}/authors/ajax-search`, body, { headers })).data;
      return getHtml(searchResult.html);

    } else {
      const { data: html } = await this.loadPage(decodeURI(url));
      return getHtml(html);
    }
  }
  
  async parseGenres(url: string) {

    const { data: html } = await this.loadPage(url);
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

  async parseAuthorPrefixes(url: string) {
    const { data: html } = await this.loadPage(url);
    const document = parseHtml(html);
    const list = document.querySelectorAll('#author-prefix-filter li a');

    return list.map(s => s?.text?.trim());
  }


  private secutiryKey(htmlBody: string) {
    const regex = /,LIVESTREET_SECURITY_KEY\s?=\s?'(.*)',LANGUAGE/;
    const match = htmlBody.match(regex);
    if (match && match.length > 1) return match[1];
    return null;
  }

  private async loadPage(url: string) {
    const headers = {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
    }
    return (await axios.get<string>(encodeURI(url), { headers }));
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

  private async getBookStreams(bookInfo: BookIInfoFromExternalServer & { bid: string, stringBookId: string; }) {

    const items = bookInfo.items;
    const server = bookInfo.srv;
    const bookId = +bookInfo.bid;
    const key = bookInfo.key;
    const title = bookInfo.title;
    const result: AudioInfo[] = [];
    const filesIds = new Set<number>(items.map(s => s.file));

    for (const fileId of filesIds) {
      const itemsForId = items.filter(s => s.file == fileId);

      for (const item of itemsForId) {

        const streamInfo: StreamFileInfo = {} as StreamFileInfo;
        streamInfo.fileLength = 0;
        streamInfo.bookId = bookId,
        streamInfo.fileLength = itemsForId.reduce((p, n) => p + n.duration, 0);
        streamInfo.order = fileId;
        streamInfo.start = item.time_from_start;
        streamInfo.finish = item.time_finish;
        streamInfo.duration = item.duration;
        streamInfo.key = key;
        streamInfo.server = server;
        streamInfo.title = encodeURI(title);

        const stream = new URLSearchParams(streamInfo as {}).toString();

        result.push({
          title: item.title,
          audio : `/api/books/${bookInfo.stringBookId}/audio?${stream}`,
          length: this.getDuration(item.duration),
        })
      }
    }
    return result;
  }

  private getDuration(duration: number) {

    const seconds = duration % 60;
    const minutes = Math.trunc(duration / 60 > 59 ?  (duration / 60) % 60 : (duration / 60));
    const hours =  Math.trunc(duration / 60 > 59 ?  (duration / 60) / 60 : 0);

    return {
      hours,
      minutes,
      seconds
    }
  }

  private async isNotValidPage(url: string) {
    try {
      return (await axios.head(url)).status === 404;
    } catch {
      return true;
    }
  }

  private getRelatedBooks(element: HTMLElement) {
    return element.querySelectorAll('.content__main__book--item--series-list a').map(a => ({
      id: this.splitStringByDelimiter(a.attributes.href, "/").pop(),
      name: a?.text?.trim(),
    }))
  }

  private getSeries(element: HTMLElement) {
    const series = element.querySelector(".caption__article--about-block.about--series");

    if (series) {
      return {
        id: decodeURI(this.splitStringByDelimiter(series.querySelector('.content__article--about-content a')?.attributes?.href, "/").pop()),
        name: series.querySelector('.content__article--about-content span')?.text?.trim()
      }
    } else return null;
  }

}
