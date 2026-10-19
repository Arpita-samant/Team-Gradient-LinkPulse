import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Sparkles, QrCode, Zap, ShieldCheck } from 'lucide-react';

export default function HeroIllustration({ theme = 'dark' }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse Parallax & 3D Tilt Interaction
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max tilt angle (degrees)
    const maxTilt = 12;
    const tiltX = -((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleCopyDemo = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('https://linkpulse.io/demo77');
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-md mx-auto perspective-1000 -translate-y-4 sm:-translate-y-6 lg:-translate-y-8 select-none"
    >
      {/* Nothing OS Technical 4-Corner Crosshairs Framing */}
      <div className="absolute top-0 left-0 font-mono text-xs text-[var(--fg-dim)] z-20 pointer-events-none select-none">
        +
      </div>
      <div className="absolute top-0 right-0 font-mono text-xs text-[var(--fg-dim)] z-20 pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-0 left-0 font-mono text-xs text-[var(--fg-dim)] z-20 pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-0 right-0 font-mono text-xs text-[var(--fg-dim)] z-20 pointer-events-none select-none">
        +
      </div>

      {/* Ambient Pulsing Tech Glow & Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Pulsing Aura */}
        <div
          className="w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl transition-opacity duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(215, 25, 33, 0.28) 0%, rgba(215, 25, 33, 0.08) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(215, 25, 33, 0.16) 0%, rgba(215, 25, 33, 0.04) 50%, transparent 75%)',
            opacity: isHovered ? 1 : 0.75,
          }}
        />

        {/* Outer Tech Radar Rings */}
        <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-[var(--line)] opacity-30 animate-radar-ring pointer-events-none" />
        <div className="absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-[var(--accent)] opacity-20 pointer-events-none" />
      </div>

      {/* 3D Tilting Transform Container */}
      <div
        className="relative transition-transform duration-200 ease-out flex flex-col items-center justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        }}
      >
        {/* Floating Illustration with Levitation Animation */}
        <div className="relative animate-float-hero w-full flex items-center justify-center">
          <img
            src="/hero-illustration.png"
            alt="LinkPulse Smart URL Shortener & QR Engine"
            className="w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[450px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto"
            style={{
              filter: isDark
                ? 'drop-shadow(0 25px 35px rgba(0,0,0,0.9)) drop-shadow(0 0 25px rgba(215,25,33,0.18))'
                : 'drop-shadow(0 20px 30px rgba(0,0,0,0.12))',
            }}
          />

          {/* Interactive Floating Pill: "lnk.to/abc123" with Copy Action */}
          <div
            onClick={handleCopyDemo}
            title="Click to copy shortened link"
            className="absolute bottom-4 sm:bottom-6 left-2 sm:left-4 z-20 group cursor-pointer animate-badge-bob"
          >
            <div className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--line)] group-hover:border-[var(--accent)] rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 transition-all duration-200 group-hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] led-dot" />
              <span className="font-mono text-[11px] font-semibold text-[var(--fg)]">
                lnk.to/<span className="text-[var(--accent)]">abc123</span>
              </span>
              <div className="w-4 h-4 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors">
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-green-500" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </div>
            </div>
            {/* Copy Feedback Tooltip */}
            <div
              className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[10px] font-ndot text-[var(--accent)] whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none ${
                copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              COPIED TO CLIPBOARD!
            </div>
          </div>

          {/* Floating Top-Right Telemetry Chip */}
          <div className="absolute top-1 sm:top-2 right-2 sm:right-4 z-20 animate-badge-bob-delayed pointer-events-none">
            <div className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--line)] rounded-xl px-2.5 py-1 shadow-2xl flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg2)]">
              <Zap className="w-3 h-3 text-[var(--accent)]" />
              <span className="font-ndot text-[var(--fg)]">12ms</span>
              <span className="text-[var(--fg-dim)]">// SPEED</span>
            </div>
          </div>

          {/* Floating Top-Left Security Badge */}
          <div className="absolute top-8 sm:top-10 left-1 sm:left-2 z-20 animate-badge-bob pointer-events-none hidden sm:block">
            <div className="bg-[var(--glass)] backdrop-blur-xl border border-[var(--line)] rounded-xl px-2.5 py-1 shadow-2xl flex items-center gap-1.5 text-[10px] font-mono text-[var(--fg2)]">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="font-ndot text-[var(--fg)]">SECURE</span>
              <span className="text-[var(--fg-dim)]">// SSL</span>
            </div>
          </div>
        </div>

        {/* Dynamic Shadow Beneath Levitation */}
        <div className="w-3/4 max-w-[320px] h-3.5 bg-black/40 dark:bg-black/80 rounded-[100%] blur-md -mt-1.5 animate-float-shadow pointer-events-none" />

        {/* Bottom Technical Status Bar */}
        <div className="mt-3 flex items-center justify-between w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[450px] px-2 text-[10px] font-mono text-[var(--fg3)] border-t border-[var(--line)] pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] font-ndot">+</span>
            <span className="tracking-wider">STATUS: REAL-TIME ROUTING</span>
          </div>
          <div className="flex items-center gap-1.5 font-ndot text-[var(--accent)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] led-dot" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
