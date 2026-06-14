'use client';
import { ChevronDown } from 'lucide-react';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5 pb-2 border-b border-slate-100">
      {children}
    </h2>
  );
}

function SelectControl({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[var(--color-text-secondary)] text-sm font-medium max-w-[220px]">{label}</span>
      <div className="flex items-center justify-between px-4 py-2.5 w-44 rounded-xl border border-slate-200 bg-transparent text-sm text-[var(--color-text-secondary)] hover:bg-slate-50 cursor-pointer smooth-transition">
        <span>{value}</span>
        <ChevronDown className="w-4 h-4 opacity-40" />
      </div>
    </div>
  );
}

function ButtonControl({ label, actionText }: { label: string; actionText: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[var(--color-text-secondary)] text-sm font-medium max-w-[220px]">{label}</span>
      <button className="px-6 py-2.5 w-44 rounded-xl border border-slate-200 bg-transparent text-sm font-semibold text-[var(--color-text-primary)] hover:bg-slate-50 smooth-transition">
        {actionText}
      </button>
    </div>
  );
}

function TextLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="text-[var(--color-accent-blue)] text-sm font-medium hover:underline block py-1">
      {children}
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-10 pb-32 px-6 lg:px-14">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left Side: Settings Sections */}
        <div className="flex-1 space-y-12 max-w-xl">
          
          {/* Account */}
          <section>
            <SectionTitle>Account</SectionTitle>
            <div className="space-y-1 pl-2">
              <TextLink>Login</TextLink>
              <TextLink>Signup</TextLink>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <SectionTitle>Appearance</SectionTitle>
            <div className="space-y-0">
              <SelectControl label="Mode" value="System" />
              <SelectControl label="Ascent Color" value="Blue" />
              <SelectControl label="System Font Family" value="Bricolage Grotesque" />
            </div>
          </section>

          {/* Subtitle */}
          <section>
            <SectionTitle>Subtitle</SectionTitle>
            <div className="space-y-0">
              <SelectControl label="Subtitle Font Family" value="Bricolage Grotesque" />
              <SelectControl label="Subtitle Font Size" value="100%" />
              <SelectControl label="Subtitle Font Color" value="Blue" />
              <SelectControl label="Subtitle Background Color" value="Transparent" />
              <SelectControl label="Subtitle Background Blurness" value="0%" />
              <SelectControl label="Subtitle Opacity" value="100%" />
              <SelectControl label="Subtitle Margin" value="4%" />
            </div>
          </section>

          {/* Player Center */}
          <section>
            <SectionTitle>Player Center</SectionTitle>
            <div className="space-y-0">
              <SelectControl label="Player's metadata placement" value="Auto" />
              <SelectControl label="Automatic Subtitle" value="Enable" />
              <SelectControl label="Media Player" value="ArtPlayer" />
            </div>
          </section>

          {/* Developer Center */}
          <section>
            <SectionTitle>Developer Center</SectionTitle>
            <div className="space-y-0">
              <SelectControl label="Fetch Mode" value="Client-side" />
              <SelectControl label="Proxy Mode (api)" value="No Proxy" />
            </div>
          </section>

          {/* Miscellaneous Center */}
          <section>
            <SectionTitle>Miscellaneous Center</SectionTitle>
            <div className="space-y-0">
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
            <SectionTitle>Notification Center</SectionTitle>
            <ButtonControl label="Notification preferences" actionText="customize" />
          </section>

          {/* Features */}
          <section>
            <SectionTitle>Features</SectionTitle>
            <SelectControl label="Sync Progress and Continue Watching" value="Enable" />
          </section>

          {/* Site-Data Center */}
          <section>
            <SectionTitle>Site-Data Center</SectionTitle>
            <div className="space-y-0">
              <ButtonControl label="All site data" actionText="clear" />
              <ButtonControl label="Cookies" actionText="clear" />
              <ButtonControl label="Cache storage" actionText="clear" />
              <ButtonControl label="Local storage" actionText="clear" />
              <ButtonControl label="Service-Worker cache" actionText="clear" />
              <ButtonControl label="Clear Current Radio" actionText="clear" />
            </div>
          </section>

          {/* App Center */}
          <section>
            <SectionTitle>App Center</SectionTitle>
            <div className="pl-2">
              <TextLink>AI</TextLink>
            </div>
          </section>
        </div>

        {/* Right Side: Logo & Branding */}
        <div className="hidden lg:flex flex-col items-center justify-start pt-40 w-[340px] sticky top-0 self-start h-screen">
          <div className="flex items-end text-[#b0bec5]">
            <span className="text-[130px] font-black leading-none tracking-tighter" style={{ fontFamily: 'var(--font-sans)' }}>R</span>
            <div className="relative -ml-6">
              <span className="text-[110px] font-black leading-none tracking-tighter" style={{ fontFamily: 'var(--font-sans)' }}>V</span>
            </div>
            <div className="flex flex-col gap-2 ml-1 pb-5">
              <div className="w-7 h-3 bg-[#b0bec5] rounded-full" />
              <div className="w-9 h-3 bg-[#b0bec5] rounded-full" />
              <div className="w-12 h-3 bg-[#b0bec5] rounded-full" />
              <div className="w-16 h-3 bg-[#b0bec5] rounded-full" />
            </div>
          </div>
          <p className="text-[#b0bec5] text-sm font-medium tracking-wide mt-2">
            Your Personal Streaming Oasis
          </p>
        </div>
      </div>
    </div>
  );
}
