'use client';
import { ChevronDown } from 'lucide-react';

function SelectControl({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[var(--color-text-secondary)] font-medium text-sm w-1/2">{label}</span>
      <div className="flex items-center justify-between px-4 py-2 w-48 rounded-xl border border-[var(--color-border-medium)] bg-transparent text-sm text-[var(--color-text-secondary)] hover:bg-slate-50 cursor-pointer smooth-transition">
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </div>
    </div>
  );
}

function ButtonControl({ label, actionText }: { label: string, actionText: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[var(--color-text-secondary)] font-medium text-sm w-1/2">{label}</span>
      <button className="px-6 py-2 w-48 rounded-xl border border-[var(--color-border-medium)] bg-transparent text-sm font-bold text-[var(--color-text-primary)] hover:bg-slate-50 smooth-transition">
        {actionText}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-12 pb-32 px-8 lg:px-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
        
        {/* Left Side: Settings Sections */}
        <div className="flex-1 space-y-16">
          
          {/* Miscellaneous Center */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Miscellaneous Center</h2>
            <div className="space-y-1">
              <SelectControl label="Mini Progress Bar in Non-Embed Mode" value="Disable" />
              <SelectControl label="Continue Watching: Delete Option" value="Disable" />
              <SelectControl label="Session Resume" value="Disable" />
              <SelectControl label="Infinite Scroll" value="Disable" />
              <SelectControl label="Recommendation on Home Page" value="Enable" />
              <SelectControl label="Continue Watching on Home Page" value="Enable" />
              <SelectControl label="Rive Ads" value="Enable" />
            </div>
          </section>

          {/* Notification Center */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Notification Center</h2>
            <ButtonControl label="Notification preferences" actionText="customize" />
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Features</h2>
            <SelectControl label="Sync Progress and Continue Watching" value="Enable" />
          </section>

          {/* Player Center */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Player Center</h2>
            <div className="space-y-1">
              <SelectControl label="Player's metadata placement" value="Auto" />
              <SelectControl label="Automatic Subtitle" value="Enable" />
              <SelectControl label="Media Player" value="ArtPlayer" />
            </div>
          </section>

          {/* Developer Center */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Developer Center</h2>
            <div className="space-y-1">
              <SelectControl label="Fetch Mode" value="Client-side" />
              <SelectControl label="Proxy Mode (api)" value="No Proxy" />
            </div>
          </section>

          {/* Site-Data Center */}
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Site-Data Center</h2>
            <div className="space-y-1">
              <ButtonControl label="All site data" actionText="clear" />
              <ButtonControl label="Cookies" actionText="clear" />
              <ButtonControl label="Cache storage" actionText="clear" />
              <ButtonControl label="Local storage" actionText="clear" />
              <ButtonControl label="Service-Worker cache" actionText="clear" />
              <ButtonControl label="Clear Current Radio" actionText="clear" />
            </div>
          </section>
        </div>

        {/* Right Side: Logo & Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[400px] sticky top-32 self-start opacity-70">
          <div className="flex items-end gap-1 text-[#94a3b8] mb-4">
            <span className="text-[140px] font-black leading-none tracking-tighter">R</span>
            <span className="text-[120px] font-black leading-none tracking-tighter -ml-10">V</span>
            <div className="flex flex-col gap-2.5 ml-2 pb-4">
              <div className="w-10 h-4 bg-[#94a3b8] rounded-full" />
              <div className="w-12 h-4 bg-[#94a3b8] rounded-full" />
              <div className="w-16 h-4 bg-[#94a3b8] rounded-full" />
              <div className="w-20 h-4 bg-[#94a3b8] rounded-full" />
            </div>
          </div>
          <p className="text-[#94a3b8] text-[15px] font-medium tracking-wide">
            Your Personal Streaming Oasis
          </p>
        </div>
      </div>
    </div>
  );
}
