'use client';
import { BookOpen } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">My Library</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Explore your local streaming library, downloads, and purchased titles.
      </p>
    </div>
  );
}
