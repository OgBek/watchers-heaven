'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Bookmark, Share2, Star, Image as ImageIcon } from 'lucide-react';
import { ApiGateway } from '@/lib/api/gateway';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative w-full h-[45vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center">
          <ImageIcon className="w-16 h-16 text-slate-300" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-main)] via-transparent to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 text-sm font-medium hover:bg-white smooth-transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-20 px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Movie #{id}</h1>
          <p className="text-slate-500 mb-6">Movie details will be loaded from the TMDB API.</p>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-yellow-400" />
              <span className="font-semibold text-slate-700">N/A</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-sm">Drama</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-sm">2024</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => router.push(`/${locale}/watch/${id}`)}
              className="flex items-center gap-2 bg-[#007bff] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 smooth-transition shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Now
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 smooth-transition">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 smooth-transition">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Embedded Preview */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">Preview</h3>
          </div>
          <iframe 
            src={ApiGateway.getMovieEmbedUrl(id)}
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title="Movie Preview"
            style={{ border: 'none' }}
          />
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
