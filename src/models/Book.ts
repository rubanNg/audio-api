export interface Author extends Base {

}

export interface Series extends Base {
  
}


interface Base {
  name: string;
  id?: string;
}

export interface AudioInfo {
  title: string;
  audio: string;
  length: {
    hours: number;
    minutes: number;
    seconds: number;
  }
}


export interface Book {
  poster: string;
  genres: string[];
  author: Partial<Author>;
  description: string;
  name: string;
  id: string;
  auidio: AudioInfo[],
  relatedBooks: { name: string, id: string }[],
  series: Series,
}