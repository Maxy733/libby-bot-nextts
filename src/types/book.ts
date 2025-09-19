// src/types/book.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  coverurl: string | null;
  rating: number | null;
  publication_date: string | null;
  pages: number | null;
  language: string | null;
  isbn: string | null;
}

