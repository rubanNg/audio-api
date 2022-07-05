import { Error } from "./Error";
import { Pagination } from "./Pagination";

export interface Response<Data = any> {
  data: Data,
  error?: Error;
  pagination?: Pagination
}