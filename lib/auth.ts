import { supabase } from "./supabase";

export async function isUserUser(userId: number): Promise<boolean> {
  const { data, error } = await supabase.from("user").select().eq("id", userId);

  if (error) {
    return false;
  }

  if (data?.length !== 1) {
    return false;
  }

  const user = data[0];
  return user.role === "USER";
}

export async function isUserAdmin(userId: number): Promise<boolean> {
  const { data, error } = await supabase.from("user").select().eq("id", userId);

  if (error) {
    return false;
  }

  if (data?.length !== 1) {
    return false;
  }

  const user = data[0];
  return user.role === "ADMIN";
}
