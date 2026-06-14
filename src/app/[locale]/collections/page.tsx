'use client';
import { FolderOpen } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Collections</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Curate and view your custom movies and TV series playlists.
      </p>
    </div>
  );
}
