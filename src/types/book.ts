// src/types/book.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
  publication_date: string | Date | null;
}
