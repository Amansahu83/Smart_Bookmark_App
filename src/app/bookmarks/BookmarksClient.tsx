"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/types/bookmark";
import { addBookmark, deleteBookmark } from "./actions";

type Props = {
  initialBookmarks: Bookmark[];
  userId: string;
};

export function BookmarksClient({ initialBookmarks, userId }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [adding, setAdding] = useState(false);
  const removedRef = useRef<Bookmark | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
          }
          if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== (payload.old as { id: string }).id));
          }
          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) => (b.id === (payload.new as Bookmark).id ? (payload.new as Bookmark) : b))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setAdding(true);
    const result = await addBookmark(formData);
    setAdding(false);
    if (!result.error && result.data) {
      setBookmarks((prev) => [result.data as Bookmark, ...prev]);
      form.reset();
    } else if (result.error) {
      console.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    setBookmarks((prev) => {
      const removed = prev.find((b) => b.id === id);
      removedRef.current = removed ?? null;
      return prev.filter((b) => b.id !== id);
    });
    const result = await deleteBookmark(id);
    if (result?.error) {
      console.error(result.error);
      const putBack = removedRef.current;
      if (putBack) {
        setBookmarks((prev) => [putBack, ...prev]);
      }
      removedRef.current = null;
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookmarks</h1>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-8">
        <input
          type="url"
          name="url"
          placeholder="https://example.com"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          className="border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <ul className="space-y-4">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate block"
              >
                {b.title}
              </a>
              <p className="text-sm text-gray-500 truncate">{b.url}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(b.id)}
              className="shrink-0 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {bookmarks.length === 0 && (
        <p className="text-gray-500 text-center py-8">No bookmarks yet. Add one above.</p>
      )}
    </div>
  );
}
