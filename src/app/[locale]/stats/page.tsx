'use client';
import { BarChart2 } from 'lucide-react';

export default function StatsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <BarChart2 className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Stats</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Track your viewing habits, total watch time, and genre preferences over time.
      </p>
    </div>
  );
}
