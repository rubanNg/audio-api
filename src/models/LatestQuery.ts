import { BookType } from "./enums/BookType";

export interface LatestQuery {
  type: BookType,
  page: number
}