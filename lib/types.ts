export type Book = {
  id: number;
  isbn: string;
  title: string;
  author: string;
  checked_out_at: Date;
  checked_out_by: number;
};
