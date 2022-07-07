import { Injectable } from "@nestjs/common";
import { BookType } from "src/models/enums/BookType";
import { TopBooksQuery } from "src/models/TopBooksQuery";
import { Period } from "src/models/Period";
import { SearchQuery } from "src/models/SearchQuery";
import { LatestQuery } from "src/models/LatestQuery";

@Injectable()
export class UrlService {
  baseUrl = "https://akniga.org";

  buildLatestUrl({ type, page }: LatestQuery) {

    const latestBooksUrls = {
      withPage: `${this.baseUrl}/index/page${page}`,
      storiesWithPage: `${this.baseUrl}/index/${type}/new/page${page}`,
      novelsWithPage: `${this.baseUrl}/index/${type}/new/page${page}`
    }

    if (type === BookType.Stories) return latestBooksUrls.storiesWithPage;
    if (type === BookType.Novels) return latestBooksUrls.novelsWithPage;

    return latestBooksUrls.withPage;
  }

  buildBookUrl(id: string) {
    return `${this.baseUrl}/${id}`;
  }

  buildAdditionalsUrls() {
    return {
      genres: `${this.baseUrl}/sections`
    }
  }

  buildTopBooksUrls({ page, period, genre, type }: TopBooksQuery) {

    const latestBooksUrls = {
      topIndexPage: `${this.baseUrl}/index/top/page${page}?period=${period}`,
      topIndexWithGenre: `${this.baseUrl}/section/${genre}/top/page${page}?period=${period}`,
      stories: {
        topStories: `${this.baseUrl}/index/stories/top/page${page}?period=${period}`,
        topStoriesWithGenre: `${this.baseUrl}/section/${genre}/${type}/top/page${page}?period=${period}`,
      },
      novels: {
        topNovels: `${this.baseUrl}/index/novels/top/page${page}?period=${period}`,
        topNovelsWithGenre: `${this.baseUrl}/section/${genre}/${type}/top/page${page}?period=${period}`,
      }
    }

    if (genre && !type) return latestBooksUrls.topIndexWithGenre;

    if (type === BookType.Stories) {
      if (genre) return latestBooksUrls.stories.topStoriesWithGenre;
      else return latestBooksUrls.stories.topStories;
    }
    if (type === BookType.Novels) {
      if (genre) return latestBooksUrls.novels.topNovelsWithGenre;
      else return latestBooksUrls.novels.topNovels;
    }

    return latestBooksUrls.topIndexPage;
  }

  buildSearchUrl({page, value}: SearchQuery) {
    return `${this.baseUrl}/search/books/page${page}?q=${value}`;
  }

  buidlSeriesUrl(id: string) {
    return `${this.baseUrl}/series/${id}`;
  }

}