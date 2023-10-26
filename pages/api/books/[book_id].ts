import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../lib/types";
import { supabase } from "../../../lib/supabase";
import { isUserAdmin } from "@/lib/auth";

type DeleteBookResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteBookResponse>
) {
  const userId = req.headers.user_id;
  const isAdmin = await isUserAdmin(Number(userId));
  if (!isAdmin) {
    res.status(401).end();
    return;
  }

  if (req.method === "DELETE") {
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
