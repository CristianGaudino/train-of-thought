"use client";

import { useState } from "react";

export default function StructuredPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 text-zinc-900 flex">

      {/* Sidebar */}
      <aside className="w-[260px] border-r border-zinc-200 bg-white p-6 hidden md:flex flex-col gap-6">
        <h2 className="font-semibold text-lg">Your Idea</h2>

        <div className="space-y-2">
          <p className="text-sm text-zinc-500 uppercase tracking-wide">Branches</p>
          <p className="text-zinc-400 text-sm italic">(Coming in Phase 2)</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-zinc-500 uppercase tracking-wide">Notes</p>
          <p className="text-zinc-400 text-sm italic">(Coming later)</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-zinc-500 uppercase tracking-wide">Assets</p>
          <p className="text-zinc-400 text-sm italic">(Coming later)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Structured Mode</h1>
          <p className="text-zinc-600">
            Start with a concrete idea and develop it with clarity and structure.
          </p>
        </header>

        {/* Form Area */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm">Idea Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="e.g. A sci-fi mystery about a sentient train station"
              className="
                px-4 py-3 rounded-xl border border-zinc-300 
                bg-white shadow-sm
              "
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm">Short Description</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="Describe your idea in a few sentences..."
              className="
                px-4 py-3 rounded-xl border border-zinc-300
                bg-white shadow-sm resize-none
              "
            />
          </div>
        </div>

        {/* Placeholder structure tools */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <p className="text-zinc-400 italic">
            (Idea structure tools will appear here in Phase 2.)
          </p>
        </div>
      </div>
    </main>
  );
}
