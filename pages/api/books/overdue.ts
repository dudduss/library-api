import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../lib/types";
import { supabase } from "../../../lib/supabase";
import { CHECKOUT_PERIOD_DAYS } from "../../../lib/constants";
import { isUserAdmin } from "@/lib/auth";

type OverdueBooksResponse = {
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
   * Get /api/books/overdue
   * Get all books that are overdue
   */
  if (req.method === "GET") {
    const currentDate = new Date();
    const dateToCompare = new Date(
      currentDate.getTime() - CHECKOUT_PERIOD_DAYS * 24 * 60 * 60 * 1000
    );
    // convert Date to yyyy-mm-dd format for Supabase
    const dateToCompareString = dateToCompare.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("book")
      .select()
      .lt("checked_out_at", dateToCompareString);

    if (error) {
      const response: OverdueBooksResponse = { error };
      res.status(500).json(response);
    } else {
      const response: OverdueBooksResponse = { data };
      res.status(200).json(response);
    }
  } else {
    res.status(405).end();
  }
}
