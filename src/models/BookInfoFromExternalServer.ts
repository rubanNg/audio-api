import { BookItemsFromExternalServer } from "./BookItemsFromExternalServer";

export interface BookIInfoFromExternalServer {
  author: string;
  bStateError: boolean;
  bookurl: string;
  items: BookItemsFromExternalServer[];
  key: string;
  preview: string;
  sMsg: string;
  sMsgTitle: string;
  sTextAuthor: string;
  sTextFav: string;
  sTextPerformer: string;
  srv: string;
  title: string;
  titleonly: string;
  topic_id: string;
}