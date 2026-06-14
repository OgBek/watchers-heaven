'use client';
import { Drama } from 'lucide-react';

export default function TheaterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <Drama className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Cinema Theater</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Experience cinema-mode theater streaming with community lobbies and group watch parties.
      </p>
    </div>
  );
}
