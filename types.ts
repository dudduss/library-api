export type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  checked_out_at: Date;
  checked_out_user_id: string;
};
