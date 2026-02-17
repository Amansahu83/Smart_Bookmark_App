"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBookmark(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const url = formData.get("url") as string;
  const title = formData.get("title") as string;
  if (!url?.trim() || !title?.trim()) return { error: "URL and title required" };

  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      url: url.trim(),
      title: title.trim(),
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/bookmarks");
  return { data: bookmark };
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  return { ok: true };
}
