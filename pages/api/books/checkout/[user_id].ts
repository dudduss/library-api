import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../../lib/types";
import { supabase } from "../../../../lib/supabase";
import { isUserUser } from "@/lib/auth";

type GetCheckedOutBooksResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetCheckedOutBooksResponse>
) {
  if (req.method === "GET") {
    // TODO: Use req.headers.userId to determine the user making the request instead of using URL params.
    const { user_id } = req.query;
    const isUser = await isUserUser(Number(user_id));
    if (!isUser) {
      res.status(401).end();
      return;
    }

    const { data, error } = await supabase
      .from("book")
      .select()
      .eq("checked_out_by", user_id);

    if (error) {
      const response: GetCheckedOutBooksResponse = { error };
      res.status(500).json(response);
    } else {
      const response: GetCheckedOutBooksResponse = { data };
      res.status(200).json(response);
    }
  } else {
    res.status(405).end();
  }
}
