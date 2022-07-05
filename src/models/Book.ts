export interface Book {
  poster: string;
  genres: string[];
  author: {
    name: string;
    id: string;
  };
  description: string;
  name: string;
  id: string;
  auidio: {
    title: string;
    stream: string;
  }[]
}