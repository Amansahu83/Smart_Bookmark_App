import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookmarksClient } from "./BookmarksClient";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen py-8">
      <header className="max-w-2xl mx-auto px-6 mb-6 flex justify-end">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </form>
      </header>
      <BookmarksClient initialBookmarks={bookmarks ?? []} userId={user.id} />
    </main>
  );
}
