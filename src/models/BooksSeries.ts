import { Book } from "./Book";
import { Books } from "./Books";
import { Response } from "./Response";

export interface BooksSeries {
  count: number;
  books: Response<Books>
}