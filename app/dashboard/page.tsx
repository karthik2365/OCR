// app/dashboard/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

export default function Dashboard() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const router = useRouter(); // Initialize router

  const notes = useQuery(api.notes.getNotes, user ? { userId: user.id } : "skip");
  const addNote = useMutation(api.notes.addNote);

  if (!user) return <p className="p-4">Please log in first.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Dream place which you want to visit {user.firstName || user.username} 👋</h1>

      <form
        onSubmit={async e => {
          e.preventDefault();
          if (!text.trim()) return;
          await addNote({ userId: user.id, text });
          setText("");
        }}
        className="flex gap-2 mb-4"
      >
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a new note..."
          className="flex-1 border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {notes?.map(note => (
          <li key={note._id} className="p-2 bg-gray-100 rounded">
            {note.text}
          </li>
        ))}
      </ul>

      {/* Go Back Button */}
      <button
        onClick={() => router.push("/")} // Redirect to main page
        className="mt-6 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
      >
        Go Back
      </button>
    </div>
  );
}