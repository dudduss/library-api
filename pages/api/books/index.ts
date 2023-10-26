import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../lib/types";
import { supabase } from "../../../lib/supabase";
import { isUserAdmin } from "@/lib/auth";

type CreateBookRequest = {
  isbn: string;
  title?: string;
  author?: string;
};

type CreateBookResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.headers.user_id;
  const isAdmin = await isUserAdmin(Number(userId));
  if (!isAdmin) {
    res.status(401).end();
    return;
  }

  /**
   * POST /api/books
   * Adds a new book to the library
   */
  if (req.method === "POST") {
    const book = req.body as CreateBookRequest;

    try {
      const { data, error } = await supabase.from("book").insert({ ...book });

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json({ data });
    } catch (error) {
      const response: CreateBookResponse = { error: (error as Error).message };
      res.status(500).json(response);
    }
  } else {
    res.status(405).end();
  }
}
