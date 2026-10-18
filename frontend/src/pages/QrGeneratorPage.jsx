import React, { useState, useEffect } from 'react';
import { qrAPI } from '../services/api';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    generateQR(inputText, darkColor, lightColor);
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
      {/* Title Header matching Page 3 */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <QrCode className="w-6 h-6" />
          </div>
          QR Code Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm pl-12">
          Turn your links into QR codes. Scan, share and connect instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700/80 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Enter URL or Text
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="https://example.com or any text"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/30 focus:border-[#5850ec] transition-all"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  QR Code Color
                </label>
                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <select
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-0 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="#000000" className="dark:bg-slate-800">Black</option>
                    <option value="#4f46e5" className="dark:bg-slate-800">Indigo</option>
                    <option value="#2563eb" className="dark:bg-slate-800">Blue</option>
                    <option value="#059669" className="dark:bg-slate-800">Emerald</option>
                    <option value="#dc2626" className="dark:bg-slate-800">Red</option>
                    <option value="#9333ea" className="dark:bg-slate-800">Purple</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Background Color
                </label>
                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <select
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-0 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="#ffffff" className="dark:bg-slate-800">White</option>
                    <option value="#f8fafc" className="dark:bg-slate-800">Light Gray</option>
                    <option value="#eef2ff" className="dark:bg-slate-800">Soft Indigo</option>
                    <option value="#ecfdf5" className="dark:bg-slate-800">Mint Green</option>
                    <option value="#fef3c7" className="dark:bg-slate-800">Warm Amber</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button matching Page 3 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 active:scale-[0.99] transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate QR Code'}</span>
            </button>
          </form>
        </div>

        {/* Right Preview Card: 5 cols matching Page 3 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center space-y-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-white self-start">
            Your QR Code
          </h2>

          <div
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-colors max-w-xs w-full"
            style={{ backgroundColor: lightColor }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="w-56 h-56 object-contain rounded-md"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
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
              <span className="text-[11px] text-slate-400 mt-1 block">
                Scan to visit
              </span>
            </div>
          </div>

          {/* Action buttons matching Page 3 */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="py-3 px-4 rounded-xl font-semibold text-white bg-[#5850ec] hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              {shareNotice ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{shareNotice ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
