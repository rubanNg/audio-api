import { BookType } from "./enums/BookType";
import { Period } from "./enums/Period";

export interface TopBooksQuery{
  page: number, 
  period: Period,
  genre: string,
  type: BookType, 
}