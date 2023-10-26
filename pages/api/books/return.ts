import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../lib/types";
import { supabase } from "../../../lib/supabase";
import { isUserUser } from "@/lib/auth";

type ReturnBookRequest = {
  userId: number;
  bookId: number;
};

type ReturnBookResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = Number(req.headers.user_id);
  const isUser = await isUserUser(userId);
  if (!isUser) {
    res.status(401).end();
    return;
  }

  if (req.method === "POST") {
    const { bookId } = req.body as ReturnBookRequest;

    try {
      const { data, error } = await supabase
        .from("book")
        .select()
        .eq("id", bookId)
        .limit(1);

      if (!data || data.length === 0) {
        throw new Error("Book not found");
      }

      // Check if book is checked out by this user
      if (data[0].checked_out_by !== userId) {
        throw new Error("This book is not checked out by this user");
      } else {
        const { data, error } = await supabase
          .from("book")
          .update({ checked_out_by: null, checked_out_at: null })
          .eq("id", bookId);

        if (error) {
          throw new Error(error.message);
        }

        res.status(200).json({ data });
      }
    } catch (error) {
      const response: ReturnBookResponse = { error: (error as Error).message };
      res.status(500).json(response);
    }
  } else {
    res.status(405).end();
  }
}
