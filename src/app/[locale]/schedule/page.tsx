'use client';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <Calendar className="w-16 h-16 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
      <p className="text-slate-500 max-w-md mt-2 text-sm">
        Plan your viewing calendar. Get reminders for upcoming episodes, movies, and live broadcasts.
      </p>
    </div>
  );
}
