import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../types";
import { supabase } from "../../../supabase";

type DeleteBookResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteBookResponse>
) {
  if (req.method === "DELETE") {
    // TODO: Authenticate request by checking req.headers.userId is a LIBRARIAN
    const { book_id } = req.query;

    try {
      const { data, error } = await supabase
        .from("book")
        .select()
        .eq("id", book_id)
        .limit(1);

      if (!data || data.length === 0) {
        throw new Error("Book not found");
      }

      // Check if book is checked out
      if (data[0].checked_out_by) {
        throw new Error("Book is checked out");
      } else {
        const { data, error } = await supabase
          .from("book")
          .delete()
          .eq("id", book_id);

        if (error) {
          throw new Error(error.message);
        }

        res.status(200).end();
      }
    } catch (error) {
      const response: DeleteBookResponse = { error: (error as Error).message };
      res.status(500).json(response);
    }
  } else {
    res.status(405).end();
  }
}
