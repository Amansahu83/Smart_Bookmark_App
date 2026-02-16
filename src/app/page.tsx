import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Props = { searchParams: { code?: string } };

export default async function HomePage({ searchParams }: Props) {
  const code = searchParams.code;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/bookmarks");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Smart Bookmark</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Sign in with Google to save and sync your bookmarks across devices.
      </p>
      <Link
        href="/auth/signin"
        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
      >
        Sign in with Google
      </Link>
    </main>
  );
}
