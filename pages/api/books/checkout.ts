import type { NextApiRequest, NextApiResponse } from "next";
import { Book } from "../../../types";
import { supabase } from "../../../supabase";
import {
  MAX_BOOKS_CHECKED_OUT,
  CHECKOUT_PERIOD_DAYS,
} from "../../../constants";

type CheckoutBookRequest = {
  userId: number;
  isbn: string;
};

type CheckoutBookResponse = {
  data?: Book[];
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // TODO: Authenticate request by checking req.headers.userId is a USER and don't need to pass in userId in body
    const { userId, isbn } = req.body as CheckoutBookRequest;

    try {
      // Check that a copy of the book is available
      const { data: bookData, error } = await supabase
        .from("book")
        .select()
        .eq("isbn", isbn)
        .is("checked_out_by", null)
        .is("checked_out_at", null)
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      if (bookData.length === 0) {
        throw new Error("This book is not available for checkout");
      }

      // Check if the user has too many books checked out
      const { data: userBooks, error: userError } = await supabase
        .from("book")
        .select()
        .eq("checked_out_by", userId);

      if (userError) {
        throw new Error(userError.message);
      }

      if (userBooks.length >= MAX_BOOKS_CHECKED_OUT) {
        throw new Error("User has too many books checked out");
      }

      // Check if any of the checked out books are overdue
      const overdueBooks = userBooks.filter((book) => {
        const dueDate = new Date(book.checked_out_at);
        dueDate.setDate(dueDate.getDate() + CHECKOUT_PERIOD_DAYS);
        return dueDate < new Date();
      });

      if (overdueBooks.length > 0) {
        throw new Error(
          `User has ${overdueBooks.length} ${
            overdueBooks.length > 1 ? "books" : "book"
          } overdue`
        );
      }

      // Checkout the book
      const { data: checkoutData, error: checkoutError } = await supabase
        .from("book")
        .update({
          checked_out_by: userId,
          checked_out_at: new Date().toISOString(),
        })
        .eq("id", bookData[0].id);

      if (checkoutError) {
        throw new Error(checkoutError.message);
      }

      res.status(200).json({ data: checkoutData });
    } catch (error) {
      const response: CheckoutBookResponse = {
        error: (error as Error).message,
      };
      res.status(500).json(response);
    }
  } else {
    res.status(405).end();
  }
}
