'use client';
import { Plus } from 'lucide-react';

export default function AddPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <Plus className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Add Content</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Request content to be added or submit a custom streaming stream URL directly.
      </p>
    </div>
  );
}
