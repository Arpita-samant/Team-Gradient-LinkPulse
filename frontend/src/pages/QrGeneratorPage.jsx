import React, { useState, useEffect } from 'react';
import { qrAPI, linkAPI } from '../services/api';
import {
  QrCode,
  Download,
  Share2,
  Sparkles,
  Link2,
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function QrGeneratorPage() {
  const [inputText, setInputText] = useState('https://example.com');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);

  // Generate initial QR code on mount
  useEffect(() => {
    generateQR('https://example.com', '#000000', '#ffffff');
  }, []);

  const generateQR = async (text, dark = darkColor, light = lightColor) => {
    if (!text || !text.trim()) return;
    try {
      setLoading(true);
      const res = await qrAPI.generate({
        text: text.trim(),
        darkColor: dark,
        lightColor: light,
        width: 400
      });
      if (res.success) {
        setQrDataUrl(res.qrDataUrl);
      }
    } catch (err) {
      console.error('Failed to generate QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    generateQR(inputText, darkColor, lightColor);

    // If input is a valid URL, also register it in LinkPulse as a QR-type link so it shows in Link Management
    const trimmed = inputText.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        let domain = '';
        try {
          domain = new URL(trimmed).hostname;
        } catch {}
        await linkAPI.create({
          originalUrl: trimmed,
          title: domain ? `${domain} (QR)` : 'QR Code Link',
          type: 'qr',
          tags: ['qr-code']
        });
      } catch (err) {
        // Silently handle if guest or network error
      }
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `linkpulse-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LinkPulse QR Code',
          text: `Scan QR code for: ${inputText}`,
          url: inputText
        });
      } catch (e) {
        // user cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(inputText);
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400">
            <QrCode className="w-6 h-6" />
          </div>
          QR Code Generator
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm pl-12">
          Turn your links into QR codes. Scan, share, and connect instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121217] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-6 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Enter URL or Text
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="https://example.com or any text"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  QR Code Color
                </label>
                <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <select
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-0 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="#000000" className="bg-white dark:bg-[#121217]">Black</option>
                    <option value="#dc2626" className="bg-white dark:bg-[#121217]">Red</option>
                    <option value="#ffffff" className="bg-white dark:bg-[#121217]">White</option>
                    <option value="#059669" className="bg-white dark:bg-[#121217]">Emerald</option>
                    <option value="#2563eb" className="bg-white dark:bg-[#121217]">Blue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Background Color
                </label>
                <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-xl">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <select
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-0 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="#ffffff" className="bg-white dark:bg-[#121217]">White</option>
                    <option value="#f8fafc" className="bg-white dark:bg-[#121217]">Light Gray</option>
                    <option value="#09090b" className="bg-white dark:bg-[#121217]">Dark Black</option>
                    <option value="#18181b" className="bg-white dark:bg-[#121217]">Zinc</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate QR Code'}</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card: 5 cols */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121217] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-6 transition-colors">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white self-start">
            Your QR Code
          </h2>

          <div
            className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-750 shadow-md flex flex-col items-center justify-center transition-colors max-w-xs w-full"
            style={{ backgroundColor: lightColor }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="w-56 h-56 object-contain rounded-md"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-zinc-400">
                Loading QR...
              </div>
            )}

            <div className="mt-4 text-center">
              <p
                className="text-xs font-mono font-medium truncate max-w-[240px]"
                style={{ color: darkColor }}
              >
                {inputText}
              </p>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                Scan to visit
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-zinc-200 dark:border-zinc-750"
            >
              {shareNotice ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{shareNotice ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
