import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../lib/types";
import { supabase } from "../../../lib/supabase";

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
  if (req.method === "POST") {
    // TODO: Authenticate request by checking req.headers.userId is a LIBRARIAN
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
