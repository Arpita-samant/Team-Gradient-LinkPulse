import React, { useState, useEffect } from 'react';
import { qrAPI, linkAPI } from '../services/api';
import {
  QrCode,
  Download,
  Share2,
  Sparkles,
  Link2,
  CheckCircle2,
  Copy,
  MessageCircle,
  Twitter,
  Image as ImageIcon,
  X
} from 'lucide-react';

export default function QrGeneratorPage() {
  const [inputText, setInputText] = useState('https://example.com');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareNotice, setShareNotice] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(null);

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

  const notifyFeedback = (msg) => {
    setShareFeedback(msg);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const copyQrText = () => {
    navigator.clipboard.writeText(inputText);
    notifyFeedback('LINK COPIED TO CLIPBOARD');
  };

  const copyQrImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      notifyFeedback('QR IMAGE COPIED TO CLIPBOARD');
    } catch (e) {
      copyQrText();
    }
  };

  const shareToWhatsapp = () => {
    const text = `Scan my QR code on LinkPulse: ${inputText}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    notifyFeedback('OPENING WHATSAPP...');
  };

  const shareToTwitter = () => {
    const text = `Scan my LinkPulse QR code: ${inputText}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    notifyFeedback('OPENING X (TWITTER)...');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (qrDataUrl && navigator.canShare) {
          try {
            const res = await fetch(qrDataUrl);
            const blob = await res.blob();
            const file = new File([blob], 'linkpulse-qr.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'LinkPulse QR Code',
                text: `Scan QR code for: ${inputText}`,
                files: [file]
              });
              notifyFeedback('SHARED SUCCESSFULLY');
              return;
            }
          } catch {}
        }
        await navigator.share({
          title: 'LinkPulse QR Code',
          text: `Scan QR code for: ${inputText}`,
          url: (inputText.startsWith('http://') || inputText.startsWith('https://')) ? inputText : undefined
        });
        notifyFeedback('SHARED SUCCESSFULLY');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    // Open share modal with copy & social options
    setShareModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="panel p-6 sm:p-8 space-y-6">
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
        <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

        <div>
          <h1 className="font-ndot text-2xl text-[var(--fg)]">QR Code Generator</h1>
          <p className="text-xs text-[var(--fg2)] mt-1 font-mono">Turn your links into QR codes. Scan, share and connect instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="qr-input" className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">Enter URL or Text</label>
              <input
                id="qr-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://example.com"
                className="input"
              />
            </div>

            <div>
              <label className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">QR Code Color</label>
              <div className="flex items-center gap-3 p-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-7 h-7 cursor-pointer border-0 bg-transparent rounded-lg"
                />
                <select
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="flex-1 text-xs font-mono uppercase bg-transparent border-0 text-[var(--fg)] focus:outline-none cursor-pointer"
                >
                  <option value="#000000" className="bg-white dark:bg-black text-black dark:text-white">Pure Black</option>
                  <option value="#d71921" className="bg-white dark:bg-black text-black dark:text-white">Nothing Red</option>
                  <option value="#ffffff" className="bg-white dark:bg-black text-black dark:text-white">Pure White</option>
                  <option value="#2a2a2a" className="bg-white dark:bg-black text-black dark:text-white">Dark Line</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-ndot text-[11px] text-[var(--fg)] mb-1.5">Background Color</label>
              <div className="flex items-center gap-3 p-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-7 h-7 cursor-pointer border-0 bg-transparent rounded-lg"
                />
                <select
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="flex-1 text-xs font-mono uppercase bg-transparent border-0 text-[var(--fg)] focus:outline-none cursor-pointer"
                >
                  <option value="#ffffff" className="bg-white dark:bg-black text-black dark:text-white">Pure White</option>
                  <option value="#f4f4f4" className="bg-white dark:bg-black text-black dark:text-white">Off White</option>
                  <option value="#000000" className="bg-white dark:bg-black text-black dark:text-white">Pure Black</option>
                  <option value="#0b0b0b" className="bg-white dark:bg-black text-black dark:text-white">Surface Black</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-solid w-full py-4 text-xs cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'GENERATING...' : 'Generate QR Code'}</span>
            </button>
          </form>

          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex flex-col items-center justify-center space-y-4">
            <div
              className="p-3 bg-white rounded-xl border border-[var(--line)] shadow-lg inline-flex items-center justify-center"
              style={{ backgroundColor: lightColor }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-[var(--fg3)] font-mono text-xs">
                  GENERATING...
                </div>
              )}
            </div>

            <div className="text-center w-full">
              <p className="font-ndot text-xs text-[var(--fg)]">Your QR Code</p>
              <p className="font-mono text-xs text-[var(--fg3)] mt-1 truncate max-w-xs mx-auto">{inputText}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  className="btn btn-solid btn-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn btn-line btn-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
              {shareFeedback && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-sm border border-[var(--accent)] bg-[var(--surface-subtle)] text-[var(--accent)] font-ndot text-[10px] animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{shareFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive QR Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="panel max-w-sm w-full p-6 space-y-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl relative">
            <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
            <span aria-hidden="true" className="pointer-events-none select-none absolute -top-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
            <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -left-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>
            <span aria-hidden="true" className="pointer-events-none select-none absolute -bottom-2 -right-1.5 font-mono text-xs leading-none text-[var(--fg)]">+</span>

            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] led-dot" />
                <h3 className="font-ndot text-sm uppercase text-[var(--fg)]">SHARE // QR MATRIX</h3>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 text-[var(--fg3)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => { copyQrText(); setShareModalOpen(false); }}
                className="w-full p-2.5 rounded-sm border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] flex items-center justify-between transition-colors cursor-pointer text-left text-[var(--fg)]"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[var(--accent)]" />
                  <span>Copy Target Link</span>
                </span>
                <Copy className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => { copyQrImage(); setShareModalOpen(false); }}
                className="w-full p-2.5 rounded-sm border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] flex items-center justify-between transition-colors cursor-pointer text-left text-[var(--fg)]"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span>Copy QR Image</span>
                </span>
                <Copy className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => { shareToWhatsapp(); setShareModalOpen(false); }}
                className="w-full p-2.5 rounded-sm border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] flex items-center justify-between transition-colors cursor-pointer text-left text-[var(--fg)]"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
                  <span>Share on WhatsApp</span>
                </span>
                <span className="text-[10px] text-[var(--fg3)] font-ndot">SEND</span>
              </button>

              <button
                type="button"
                onClick={() => { shareToTwitter(); setShareModalOpen(false); }}
                className="w-full p-2.5 rounded-sm border border-[var(--line)] hover:border-[var(--accent)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] flex items-center justify-between transition-colors cursor-pointer text-left text-[var(--fg)]"
              >
                <span className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-[var(--accent)]" />
                  <span>Share on X (Twitter)</span>
                </span>
                <span className="text-[10px] text-[var(--fg3)] font-ndot">POST</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="btn btn-line w-full py-2 text-xs uppercase tracking-wider cursor-pointer font-ndot"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
