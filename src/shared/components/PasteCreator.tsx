"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type PasteResponse = {
  id: string;
  url: string;
};

export default function PasteCreator() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PasteResponse | null>(null);

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload: {
        content: string;
        ttl_seconds?: number;
        max_views?: number;
      } = { content };

      if (ttl.trim()) payload.ttl_seconds = Number(ttl);
      if (maxViews.trim()) payload.max_views = Number(maxViews);

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer position="top-right" />

      {/* FORM */}
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        <textarea
          className="w-full min-h-35 rounded bg-slate-800 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your paste content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            min={1}
            className="rounded bg-slate-800 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="TTL seconds (optional)"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
          />

          <input
            type="number"
            min={1}
            className="rounded bg-slate-800 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Max views (optional)"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Paste"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">
            Paste created successfully
          </div>

          <div className="flex items-center justify-between gap-4">
            <code className="text-xs bg-slate-800 px-2 py-1 rounded overflow-x-auto">
              {result.url}
            </code>

            <a
              href={result.url}
              target="_blank"
              className="bg-emerald-600 hover:bg-emerald-700 transition text-sm px-4 py-2 rounded"
            >
              View Paste
            </a>
          </div>
        </div>
      )}
    </>
  );
}
