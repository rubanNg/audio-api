import { BookType } from "./enums/BookType";
import { Period } from "./Period";

export interface TopBooksQuery{
  page: number, 
  period: Period,
  genre: string,
  type: BookType, 
}